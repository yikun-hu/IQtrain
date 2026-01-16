import { Env, dbAll, dbFirst, dbRun } from "./db";
import { nowIso, parseJsonSafe } from "./utils";

function paypalBase(env: Env) {
  return env.PAYPAL_API_TYPE === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";
}

async function paypalAccessToken(env: Env) {
  const basic = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_SECRET}`);
  const r = await fetch(`${paypalBase(env)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!r.ok) throw new Error(`PayPal token error: ${r.status} ${await r.text()}`);
  const j = await r.json() as any;
  if (!j?.access_token) throw new Error("PayPal missing access_token");
  return j.access_token as string;
}

export async function paypalGetSubscription(env: Env, subscriptionId: string) {
  const token = await paypalAccessToken(env);
  const r = await fetch(`${paypalBase(env)}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(`PayPal subscription fetch error: ${r.status} ${await r.text()}`);
  return await r.json() as any;
}

export async function paypalCancelSubscription(env: Env, subscriptionId: string) {
  const token = await paypalAccessToken(env);
  const r = await fetch(`${paypalBase(env)}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ reason: "User requested cancellation" }),
  });
  if (!r.ok) throw new Error(`PayPal cancel error: ${r.status} ${await r.text()}`);
  return true;
}

function addDurationUTC(date: Date, unit: string, count: number) {
  const d = new Date(date.getTime());
  const n = Number(count || 0);
  if (!n) return d;
  switch (unit.toUpperCase()) {
    case "DAY":
    case "DAYS": d.setUTCDate(d.getUTCDate() + n); return d;
    case "WEEK":
    case "WEEKS": d.setUTCDate(d.getUTCDate() + n * 7); return d;
    case "MONTH":
    case "MONTHS": d.setUTCMonth(d.getUTCMonth() + n); return d;
    case "YEAR":
    case "YEARS": d.setUTCFullYear(d.getUTCFullYear() + n); return d;
    default: d.setUTCDate(d.getUTCDate() + n); return d;
  }
}

function pickCycle(executions: any[], tenure: string) {
  return executions.find(x => String(x?.tenure_type || "").toUpperCase() === tenure.toUpperCase()) || null;
}

// 复制你 webhook 逻辑：trial + regular 都按 1 day 计算（你原注释如此）
function computePlanExpiresAtFromCycleExecutions(startIso: string, executions: any[]) {
  const start = new Date(startIso);
  const trial = pickCycle(executions, "TRIAL");
  const regular = pickCycle(executions, "REGULAR");
  const trialTotal = Number(trial?.total_cycles ?? 0);
  const regularTotal = Number(regular?.total_cycles ?? 0);
  const expires = addDurationUTC(addDurationUTC(start, "DAY", trialTotal), "DAY", regularTotal);
  return expires.toISOString();
}

function computeLatestRegularBillWindow(startIso: string, executions: any[]) {
  const start = new Date(startIso);
  const trial = pickCycle(executions, "TRIAL");
  const regular = pickCycle(executions, "REGULAR");
  const trialTotal = Number(trial?.total_cycles ?? 0);
  let regularCompleted = Number(regular?.cycles_completed ?? 0);
  if (!Number.isFinite(regularCompleted) || regularCompleted <= 0) regularCompleted = 0;
  const billEnd = addDurationUTC(addDurationUTC(start, "DAY", trialTotal), "DAY", regularCompleted);
  const billStart = addDurationUTC(billEnd, "DAY", -1);
  return { billStart: billStart.toISOString(), billEnd: billEnd.toISOString() };
}

export async function createVerifiedOrder(env: Env, input: {
  user_id: number;
  subscription_plan_id: number;
  paypal_order_id: string; // subscription id
}) {
  const { user_id, subscription_plan_id, paypal_order_id } = input;

  const existing = await dbFirst<{ id: number; status: string }>(
    env.DB,
    "SELECT id,status FROM orders WHERE paypal_order_id=?",
    [paypal_order_id]
  );

  const pp = await paypalGetSubscription(env, paypal_order_id);
  const status = String(pp?.status || "").toLowerCase();
  const isPaid = status === "active";

  const subscriptionType = "monthly"; // 你原来写死 monthly；如果要按 plan 映射，可从 subscription_plans 读

  const now = nowIso();

  if (existing) {
    await dbRun(
      env.DB,
      "UPDATE orders SET user_id=?, subscription_plan_id=?, paypal_order_id=?, status=?, updated_at=? WHERE id=?",
      [user_id, subscription_plan_id, paypal_order_id, isPaid ? "paid" : "pending", now, existing.id]
    );

    if (isPaid) {
      // 更新 profile（服务端允许改 protected 字段）
      const startTime = String(pp?.start_time || pp?.create_time || now);
      const execs = Array.isArray(pp?.billing_info?.cycle_executions) ? pp.billing_info.cycle_executions : [];
      const expiresAt = computePlanExpiresAtFromCycleExecutions(startTime, execs);

      await dbRun(
        env.DB,
        "UPDATE profiles SET has_paid=1, subscription_type=?, subscription_expires_at=?, updated_at=? WHERE user_id=?",
        [subscriptionType, expiresAt, now, user_id]
      );
    }

    const order = await dbFirst<any>(env.DB, "SELECT * FROM orders WHERE id=?", [existing.id]);
    const profile = await dbFirst<any>(env.DB, "SELECT * FROM profiles WHERE user_id=?", [user_id]);
    return { order, profile };
  }

  if (!isPaid) {
    throw new Error(`PayPal subscription not active (status=${pp?.status})`);
  }

  const orderNo = `ORD-${Date.now()}`;
  const amount = Number(pp?.billing_info?.last_payment?.amount?.value ?? 0) || 0;

  const insert = await dbRun(
    env.DB,
    `INSERT INTO orders(order_no,user_id,subscription_plan_id,status,amount,paypal_order_id,subscription_type,paypal_payment_id,created_at,updated_at)
     VALUES(?,?,?,?,?,?,?,?,?,?)`,
    [orderNo, user_id, subscription_plan_id, "paid", amount, paypal_order_id, subscriptionType, String(pp?.id || ""), now, now]
  );

  // 更新 profile
  const startTime = String(pp?.start_time || pp?.create_time || now);
  const execs = Array.isArray(pp?.billing_info?.cycle_executions) ? pp.billing_info.cycle_executions : [];
  const expiresAt = computePlanExpiresAtFromCycleExecutions(startTime, execs);

  await dbRun(
    env.DB,
    "UPDATE profiles SET has_paid=1, subscription_type=?, subscription_expires_at=?, updated_at=? WHERE user_id=?",
    [subscriptionType, expiresAt, now, user_id]
  );

  const orderId = Number(insert.meta.last_row_id);
  const order = await dbFirst<any>(env.DB, "SELECT * FROM orders WHERE id=?", [orderId]);
  const profile = await dbFirst<any>(env.DB, "SELECT * FROM profiles WHERE user_id=?", [user_id]);
  return { order, profile };
}

export async function unsubscribe(env: Env, userId: number) {
  const paid = await dbFirst<any>(
    env.DB,
    "SELECT * FROM orders WHERE user_id=? AND status='paid' ORDER BY created_at DESC LIMIT 1",
    [userId]
  );
  if (!paid) throw new Error("No paid orders found for the user");

  const subscriptionId = String(paid.paypal_order_id || "");
  if (!subscriptionId) throw new Error("Order missing paypal_order_id (subscription id)");

  await paypalCancelSubscription(env, subscriptionId);

  const now = nowIso();
  await dbRun(env.DB, "UPDATE orders SET status='cancelled', updated_at=? WHERE id=?", [now, paid.id]);

  await dbRun(
    env.DB,
    "UPDATE profiles SET has_paid=0, subscription_type=NULL, subscription_expires_at=NULL, updated_at=? WHERE user_id=?",
    [now, userId]
  );

  const order = await dbFirst<any>(env.DB, "SELECT * FROM orders WHERE id=?", [paid.id]);
  const profile = await dbFirst<any>(env.DB, "SELECT * FROM profiles WHERE user_id=?", [userId]);
  return { order, profile };
}

export async function handlePaypalWebhook(env: Env, rawBody: string, eventType: string) {
  // 1) persist event
  await dbRun(
    env.DB,
    "INSERT INTO payment_events(payment_gateway,event_type,content,created_at) VALUES('paypal',?,?,?)",
    [eventType || null, rawBody, nowIso()]
  );

  const body = parseJsonSafe<any>(rawBody, null);
  if (!body) return { received: true, processed: false };

  const resource = body.resource || {};
  const now = nowIso();

  if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED") {
    const subscriptionId = String(resource?.id || "");
    const order = await dbFirst<any>(env.DB, "SELECT * FROM orders WHERE paypal_order_id=? LIMIT 1", [subscriptionId]);
    if (!order) return { received: true, processed: false };

    const startTime = String(resource?.start_time || "");
    const execs = Array.isArray(resource?.billing_info?.cycle_executions) ? resource.billing_info.cycle_executions : [];
    if (!startTime) return { received: true, processed: false };

    const expiresAt = computePlanExpiresAtFromCycleExecutions(startTime, execs);
    await dbRun(
      env.DB,
      "UPDATE profiles SET subscription_expires_at=?, has_paid=1, updated_at=? WHERE user_id=?",
      [expiresAt, now, order.user_id]
    );
    return { received: true, processed: true };
  }

  if (eventType === "PAYMENT.SALE.COMPLETED") {
    const subscriptionId = String(resource?.billing_agreement_id || "");
    const paypalPaymentId = String(resource?.id || "");
    const paidAt = String(resource?.create_time || now);
    const amount = Number(resource?.amount?.total ?? NaN);
    const amt = Number.isFinite(amount) ? amount : null;

    if (!subscriptionId || !paypalPaymentId) return { received: true, processed: false };

    const order = await dbFirst<any>(env.DB, "SELECT * FROM orders WHERE paypal_order_id=? LIMIT 1", [subscriptionId]);
    if (!order) return { received: true, processed: false };

    // idempotent bill record
    const existing = await dbFirst<any>(env.DB, "SELECT * FROM order_bills WHERE paypal_payment_id=? LIMIT 1", [paypalPaymentId]);

    // fetch subscription details for cycle_executions to compute bill window
    const sub = await paypalGetSubscription(env, subscriptionId);
    const subStart = String(sub?.start_time || sub?.create_time || "");
    const execs = Array.isArray(sub?.billing_info?.cycle_executions) ? sub.billing_info.cycle_executions : [];
    if (!subStart) return { received: true, processed: false };

    const { billStart, billEnd } = computeLatestRegularBillWindow(subStart, execs);

    if (!existing) {
      await dbRun(
        env.DB,
        "INSERT INTO order_bills(order_id,paypal_payment_id,paid_at,bill_start_at,bill_end_at,amount,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)",
        [order.id, paypalPaymentId, paidAt, billStart, billEnd, amt, now, now]
      );
    } else {
      await dbRun(
        env.DB,
        "UPDATE order_bills SET order_id=?, paid_at=COALESCE(paid_at,?), bill_start_at=COALESCE(bill_start_at,?), bill_end_at=COALESCE(bill_end_at,?), amount=COALESCE(amount,?), updated_at=? WHERE id=?",
        [order.id, paidAt, billStart, billEnd, amt, now, existing.id]
      );
    }

    await dbRun(
      env.DB,
      "UPDATE profiles SET subscription_expires_at=?, has_paid=1, updated_at=? WHERE user_id=?",
      [billEnd, now, order.user_id]
    );

    return { received: true, processed: true };
  }

  if (eventType === "BILLING.SUBSCRIPTION.CANCELLED") {
    const subscriptionId = String(resource?.id || "");
    const order = await dbFirst<any>(env.DB, "SELECT * FROM orders WHERE paypal_order_id=? LIMIT 1", [subscriptionId]);
    if (!order) return { received: true, processed: false };

    await dbRun(env.DB, "UPDATE orders SET status='cancelled', updated_at=? WHERE id=?", [now, order.id]);
    return { received: true, processed: true };
  }

  return { received: true, processed: false };
}
