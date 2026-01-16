import { Env, dbAll, dbFirst, dbRun } from "./db";
import { badRequest, forbidden, json, notFound, nowIso, parseJsonSafe, toInt, unauthorized } from "./utils";
import { createOtp, getUserFromRequest, sessionCookie, signOut, verifyOtpAndCreateSession } from "./auth";
import { sendOtpEmail } from "./email";
import { createVerifiedOrder, handlePaypalWebhook, unsubscribe } from "./paypal";
// import { Request, Response, Headers } from '@cloudflare/workers-types'

async function readJson(req: Request) {
  const t = await req.text();
  return parseJsonSafe<any>(t, null);
}

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

async function requireAuth(env: Env, req: Request) {
  const u = await getUserFromRequest(env, req);
  if (!u) return { ok: false as const, resp: unauthorized() };
  return { ok: true as const, user: u };
}

function requireAdmin(user: { role: string }) {
  return user.role === "admin";
}

/** profiles_block_protected_columns 的代码实现 */
function filterProfileUpdates(userRole: "user" | "admin", updates: any) {
  const protectedKeys = new Set(["role", "has_paid", "subscription_type", "subscription_expires_at", "email", "user_id"]);
  if (userRole === "admin") return updates;

  for (const k of Object.keys(updates || {})) {
    if (protectedKeys.has(k)) {
      throw new Error(`Not allowed to update protected column: ${k}`);
    }
  }
  return updates;
}

export async function handleApi(env: Env, req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  // ---------- AUTH ----------
  if (req.method === "GET" && path === "/api/auth/me") {
    const u = await getUserFromRequest(env, req);
    if (!u) return json({ user: null });
    return json({ user: u });
  }

  if (req.method === "POST" && path === "/api/auth/sign-in-otp") {
    const body = await readJson(req);
    const email = String(body?.email || "").toLowerCase();
    const language = body?.language ? String(body.language) : undefined;
    if (!isEmail(email)) return badRequest("Invalid email");

    // 创建 OTP
    const otp = await createOtp(env, email, language);
    await sendOtpEmail(env, email, otp.code, language);

    return json({ ok: true });
  }

  if (req.method === "POST" && path === "/api/auth/verify-otp") {
    const body = await readJson(req);
    const email = String(body?.email || "").toLowerCase();
    const token = String(body?.token || "");
    if (!isEmail(email) || token.length < 4) return badRequest("Invalid payload");

    const r = await verifyOtpAndCreateSession(env, email, token);
    if (!r.ok) return badRequest("Invalid or expired OTP");

    const resp = json({ user: r.user });
    const h = new Headers(resp.headers);
    h.set("Set-Cookie", sessionCookie(r.sessionToken));
    return new Response(resp.body, { status: resp.status, headers: h });
  }

  if (req.method === "POST" && path === "/api/auth/sign-out") {
    await signOut(env, req);
    const resp = json({ ok: true });
    const h = new Headers(resp.headers);
    h.set("Set-Cookie", "session=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0");
    return new Response(resp.body, { status: resp.status, headers: h });
  }

  // ---------- PROFILES ----------
  if (req.method === "GET" && path === "/api/profile") {
    const a = await requireAuth(env, req);
    if (!a.ok) return a.resp;

    const p = await dbFirst<any>(env.DB, "SELECT * FROM profiles WHERE user_id=?", [a.user.id]);
    return json({ profile: p });
  }

  if (req.method === "PATCH" && path === "/api/profile") {
    const a = await requireAuth(env, req);
    if (!a.ok) return a.resp;

    const body = await readJson(req);
    if (!body || typeof body !== "object") return badRequest("Invalid body");

    try {
      const updates = filterProfileUpdates(a.user.role, body);

      const allowed = ["full_name", "age", "gender"];
      const patch: any = {};
      for (const k of allowed) if (k in updates) patch[k] = updates[k];
      patch.updated_at = nowIso();

      await dbRun(
        env.DB,
        "UPDATE profiles SET full_name=COALESCE(?,full_name), age=COALESCE(?,age), gender=COALESCE(?,gender), updated_at=? WHERE user_id=?",
        [patch.full_name ?? null, patch.age ?? null, patch.gender ?? null, patch.updated_at, a.user.id]
      );

      const p = await dbFirst<any>(env.DB, "SELECT * FROM profiles WHERE user_id=?", [a.user.id]);
      return json({ profile: p });
    } catch (e: any) {
      return forbidden(e?.message || "Not allowed");
    }
  }

  // 取消订阅（原 supabase.functions.invoke('unsubscribe')）
  if (req.method === "POST" && path === "/api/subscription/cancel") {
    const a = await requireAuth(env, req);
    if (!a.ok) return a.resp;
    const result = await unsubscribe(env, a.user.id);
    return json(result);
  }

  // ---------- IQ QUESTIONS ----------
  if (req.method === "GET" && path === "/api/iq-questions") {
    const rows = await dbAll<any>(env.DB, "SELECT * FROM iq_questions ORDER BY question_number ASC", []);
    return json(rows);
  }

  const iqMatch = path.match(/^\/api\/iq-questions\/(\d+)$/);
  if (req.method === "GET" && iqMatch) {
    const n = toInt(iqMatch[1], 0);
    const row = await dbFirst<any>(env.DB, "SELECT * FROM iq_questions WHERE question_number=?", [n]);
    return json(row);
  }

  // ---------- TEST RESULTS ----------
  if (req.method === "POST" && path === "/api/test-results") {
    const a = await requireAuth(env, req);
    if (!a.ok) return a.resp;

    const body = await readJson(req);
    if (!body) return badRequest("Invalid body");

    const now = nowIso();
    await dbRun(
      env.DB,
      `INSERT INTO test_results(user_id,answers,score,iq_score,dimension_scores,time_taken,completed_at,created_at,test_type)
       VALUES(?,?,?,?,?,?,?,?,?)`,
      [
        a.user.id,
        JSON.stringify(body.answers ?? {}),
        toInt(body.score, 0),
        toInt(body.iq_score ?? body.score, 0),
        JSON.stringify(body.dimension_scores ?? {}),
        toInt(body.time_taken, 0),
        body.completed_at ? String(body.completed_at) : now,
        now,
        body.test_type ? String(body.test_type) : "iq",
      ]
    );

    const id = (await dbFirst<{ id: number }>(env.DB, "SELECT last_insert_rowid() as id", []))!.id;
    const row = await dbFirst<any>(env.DB, "SELECT * FROM test_results WHERE id=?", [id]);
    return json(row, { status: 201 });
  }

  if (req.method === "GET" && path === "/api/test-results") {
    const a = await requireAuth(env, req);
    if (!a.ok) return a.resp;
    const testType = url.searchParams.get("test_type"); // 可选
    const rows = testType
      ? await dbAll<any>(env.DB, "SELECT * FROM test_results WHERE user_id=? AND test_type=? ORDER BY completed_at DESC", [a.user.id, testType])
      : await dbAll<any>(env.DB, "SELECT * FROM test_results WHERE user_id=? ORDER BY completed_at DESC", [a.user.id]);
    return json(rows);
  }

  if (req.method === "GET" && path === "/api/test-results/latest") {
    const a = await requireAuth(env, req);
    if (!a.ok) return a.resp;
    const testType = url.searchParams.get("test_type") || "iq";
    const row = await dbFirst<any>(env.DB, "SELECT * FROM test_results WHERE user_id=? AND test_type=? ORDER BY completed_at DESC LIMIT 1", [a.user.id, testType]);
    return json(row);
  }

  // ---------- TRAINING ----------
  if (req.method === "POST" && path === "/api/training-records") {
    const a = await requireAuth(env, req);
    if (!a.ok) return a.resp;
    const body = await readJson(req);
    if (!body) return badRequest("Invalid body");

    await dbRun(
      env.DB,
      "INSERT INTO training_records(user_id,game_name,score,duration,completed_at,created_at) VALUES(?,?,?,?,?,?)",
      [
        a.user.id,
        String(body.game_name || ""),
        body.score == null ? null : toInt(body.score, 0),
        body.duration == null ? null : toInt(body.duration, 0),
        body.completed_at ? String(body.completed_at) : nowIso(),
        nowIso(),
      ]
    );
    return json({ ok: true }, { status: 201 });
  }

  if (req.method === "GET" && path === "/api/training-records") {
    const a = await requireAuth(env, req);
    if (!a.ok) return a.resp;
    const limit = url.searchParams.get("limit");
    const rows = limit
      ? await dbAll<any>(env.DB, "SELECT * FROM training_records WHERE user_id=? ORDER BY completed_at DESC LIMIT ?", [a.user.id, toInt(limit, 20)])
      : await dbAll<any>(env.DB, "SELECT * FROM training_records WHERE user_id=? ORDER BY completed_at DESC", [a.user.id]);
    return json(rows);
  }

  // ---------- GAMES ----------
  if (req.method === "GET" && path === "/api/games") {
    const rows = await dbAll<any>(env.DB, "SELECT * FROM games ORDER BY created_at DESC", []);
    return json(rows);
  }

  const catMatch = path.match(/^\/api\/games\/category\/(.+)$/);
  if (req.method === "GET" && catMatch) {
    const category = decodeURIComponent(catMatch[1]);
    const rows = await dbAll<any>(env.DB, "SELECT * FROM games WHERE category=? ORDER BY created_at DESC", [category]);
    return json(rows);
  }

  if (req.method === "GET" && path === "/api/games/random") {
    const count = toInt(url.searchParams.get("count"), 3);
    const rows = await dbAll<any>(env.DB, "SELECT * FROM games LIMIT 200", []);
    // shuffle
    rows.sort(() => Math.random() - 0.5);
    return json(rows.slice(0, Math.max(1, Math.min(count, 20))));
  }

  // ---------- TEST TYPES ----------
  if (req.method === "GET" && path === "/api/tests") {
    const rows = await dbAll<any>(env.DB, "SELECT * FROM tests ORDER BY created_at DESC", []);
    return json(rows);
  }

  // ---------- SUBSCRIPTION PLANS ----------
  if (req.method === "GET" && path === "/api/subscription-plans/active") {
    const rows = await dbAll<any>(env.DB, "SELECT * FROM subscription_plans WHERE is_active=1 ORDER BY created_at DESC", []);
    return json(rows);
  }

  // ---------- Payment gateway config (public: no secret) ----------
  if (req.method === "GET" && path === "/api/payment-gateway-config") {
    const row = await dbFirst<any>(
      env.DB,
      "SELECT id,gateway_name,client_id,is_active,updated_at FROM payment_gateway_config WHERE is_active=1 ORDER BY id DESC LIMIT 1",
      []
    );
    return json(row);
  }

  // ---------- Orders ----------
  if (req.method === "POST" && path === "/api/orders") {
    const a = await requireAuth(env, req);
    if (!a.ok) return a.resp;
    const body = await readJson(req);
    if (!body) return badRequest("Invalid body");

    const now = nowIso();
    const orderNo = body.order_no ? String(body.order_no) : `ORD-${Date.now()}`;
    await dbRun(
      env.DB,
      `INSERT INTO orders(order_no,user_id,status,subscription_type,amount,paypal_order_id,paypal_payment_id,subscription_plan_id,created_at,updated_at)
       VALUES(?,?,?,?,?,?,?,?,?,?)`,
      [
        orderNo,
        a.user.id,
        String(body.status || "pending"),
        String(body.subscription_type || "one_time"),
        Number(body.amount || 0),
        body.paypal_order_id ? String(body.paypal_order_id) : null,
        body.paypal_payment_id ? String(body.paypal_payment_id) : null,
        body.subscription_plan_id == null ? null : toInt(body.subscription_plan_id, 0),
        now,
        now,
      ]
    );

    const id = (await dbFirst<{ id: number }>(env.DB, "SELECT last_insert_rowid() as id", []))!.id;
    const row = await dbFirst<any>(env.DB, "SELECT * FROM orders WHERE id=?", [id]);
    return json(row, { status: 201 });
  }

  const orderIdMatch = path.match(/^\/api\/orders\/(\d+)$/);
  if (req.method === "GET" && orderIdMatch) {
    const a = await requireAuth(env, req);
    if (!a.ok) return a.resp;
    const id = toInt(orderIdMatch[1], 0);
    const row = await dbFirst<any>(env.DB, "SELECT * FROM orders WHERE id=?", [id]);
    if (!row) return notFound();
    if (row.user_id !== a.user.id && !requireAdmin(a.user)) return forbidden();
    return json(row);
  }

  const orderNoMatch = path.match(/^\/api\/orders\/by-order-no\/(.+)$/);
  if (req.method === "GET" && orderNoMatch) {
    const a = await requireAuth(env, req);
    if (!a.ok) return a.resp;
    const orderNo = decodeURIComponent(orderNoMatch[1]);
    const row = await dbFirst<any>(env.DB, "SELECT * FROM orders WHERE order_no=?", [orderNo]);
    if (!row) return notFound();
    if (row.user_id !== a.user.id && !requireAdmin(a.user)) return forbidden();
    return json(row);
  }

  if (req.method === "GET" && path === "/api/orders") {
    const a = await requireAuth(env, req);
    if (!a.ok) return a.resp;
    const rows = await dbAll<any>(env.DB, "SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC", [a.user.id]);
    return json(rows);
  }

  // ---------- PayPal: createVerifiedOrder ----------
  if (req.method === "POST" && path === "/api/paypal/create-verified-order") {
    const a = await requireAuth(env, req);
    if (!a.ok) return a.resp;
    const body = await readJson(req);
    if (!body?.paypal_order_id || !body?.subscription_plan_id) return badRequest("Missing fields");

    const result = await createVerifiedOrder(env, {
      user_id: a.user.id,
      subscription_plan_id: toInt(body.subscription_plan_id, 0),
      paypal_order_id: String(body.paypal_order_id),
    });
    return json(result);
  }

  // ---------- PayPal webhook ----------
  if (req.method === "POST" && path === "/api/paypal/webhook") {
    const eventType =
      req.headers.get("paypal-event-type") ||
      req.headers.get("Paypal-Event-Type") ||
      "";

    const raw = await req.text();
    const result = await handlePaypalWebhook(env, raw, eventType);
    return json(result);
  }

  // ---------- Refund requests ----------
  if (req.method === "POST" && path === "/api/refund-requests") {
    const body = await readJson(req);
    if (!body?.email) return badRequest("Missing email");

    const email = String(body.email).toLowerCase();
    const u = await getUserFromRequest(env, req);

    const now = nowIso();
    await dbRun(
      env.DB,
      `INSERT INTO refund_requests(email,user_id,status,reason,amount,payment_type,created_at,updated_at)
       VALUES(?,?,?,?,?,?,?,?)`,
      [
        email,
        u ? u.id : null,
        "pending",
        body.reason ? String(body.reason) : null,
        body.amount == null ? null : Number(body.amount),
        body.payment_type ? String(body.payment_type) : null,
        now,
        now,
      ]
    );
    const id = (await dbFirst<{ id: number }>(env.DB, "SELECT last_insert_rowid() as id", []))!.id;
    const row = await dbFirst<any>(env.DB, "SELECT * FROM refund_requests WHERE id=?", [id]);
    return json(row, { status: 201 });
  }

  // 用户查看：只允许登录用户查看与自己 email 相同的记录（等价你 supabase policy 的精神）
  if (req.method === "GET" && path === "/api/refund-requests") {
    const a = await requireAuth(env, req);
    if (!a.ok) return a.resp;

    const rows = await dbAll<any>(
      env.DB,
      "SELECT * FROM refund_requests WHERE email=? ORDER BY created_at DESC",
      [a.user.email]
    );
    return json(rows);
  }

  // ---------- SUBSCRIPTION PLANS (public active) ----------
  if (req.method === "GET" && path === "/api/subscription-plans/active") {
    const rows = await dbAll<any>(
      env.DB,
      "SELECT * FROM subscription_plans WHERE is_active=1 ORDER BY created_at DESC",
      []
    );
    return json(rows);
  }

  // 单个 plan：普通用户只允许读取 active；admin 可读取全部
  const planIdMatchPublic = path.match(/^\/api\/subscription-plans\/(\d+)$/);
  if (req.method === "GET" && planIdMatchPublic) {
    const id = toInt(planIdMatchPublic[1], 0);

    const u = await getUserFromRequest(env, req);
    const isAdmin = u?.role === "admin";

    const row = isAdmin
      ? await dbFirst<any>(env.DB, "SELECT * FROM subscription_plans WHERE id=?", [id])
      : await dbFirst<any>(env.DB, "SELECT * FROM subscription_plans WHERE id=? AND is_active=1", [id]);

    return json(row);
  }

  // ---------- Payment gateway config (public safe) ----------
  if (req.method === "GET" && path === "/api/payment-gateway-config") {
    const row = await dbFirst<any>(
      env.DB,
      "SELECT id,gateway_name,client_id,is_active,updated_at FROM payment_gateway_config WHERE is_active=1 ORDER BY id DESC LIMIT 1",
      []
    );
    return json(row);
  }

  // ---------- SCALE TEST (public read) ----------

  // GET /api/scale-test/questions?test_type=...
  if (req.method === "GET" && path === "/api/scale-test/questions") {
    const testType = url.searchParams.get("test_type");
    if (!testType) return badRequest("Missing test_type");

    const rows = await dbAll<any>(
      env.DB,
      "SELECT * FROM scale_test_questions WHERE test_type=? ORDER BY display_order ASC",
      [testType]
    );
    return json(rows);
  }

  // GET /api/scale-test/scoring-rules?test_type=...&language=... (language 可选)
  if (req.method === "GET" && path === "/api/scale-test/scoring-rules") {
    const testType = url.searchParams.get("test_type");
    if (!testType) return badRequest("Missing test_type");
    const language = url.searchParams.get("language"); // 你原先未严格用语言

    const rows = language
      ? await dbAll<any>(
        env.DB,
        "SELECT * FROM scale_scoring_rules WHERE test_type=? AND language=? ORDER BY level ASC",
        [testType, language]
      )
      : await dbAll<any>(
        env.DB,
        "SELECT * FROM scale_scoring_rules WHERE test_type=? ORDER BY level ASC",
        [testType]
      );

    return json(rows);
  }

  // GET /api/scale-test/scoring-rule-by-score?test_type=...&score=...
  if (req.method === "GET" && path === "/api/scale-test/scoring-rule-by-score") {
    const testType = url.searchParams.get("test_type");
    const score = toInt(url.searchParams.get("score"), NaN as any);
    if (!testType) return badRequest("Missing test_type");
    if (!Number.isFinite(score)) return badRequest("Invalid score");

    const row = await dbFirst<any>(
      env.DB,
      "SELECT * FROM scale_scoring_rules WHERE test_type=? AND score_min<=? AND score_max>=? ORDER BY level ASC LIMIT 1",
      [testType, score, score]
    );
    return json(row);
  }

  // GET /api/scale-test/config?test_type=...
  if (req.method === "GET" && path === "/api/scale-test/config") {
    const testType = url.searchParams.get("test_type");
    if (!testType) return badRequest("Missing test_type");

    const row = await dbFirst<any>(
      env.DB,
      "SELECT * FROM scale_test_configs WHERE test_type=? LIMIT 1",
      [testType]
    );
    return json(row);
  }

  // ---------- Orders: update status ----------
  const orderStatusMatch = path.match(/^\/api\/orders\/(\d+)\/status$/);
  if (req.method === "PATCH" && orderStatusMatch) {
    const a = await requireAuth(env, req);
    if (!a.ok) return a.resp;

    const orderId = toInt(orderStatusMatch[1], 0);
    const body = await readJson(req);
    if (!body?.status) return badRequest("Missing status");

    const order = await dbFirst<any>(env.DB, "SELECT * FROM orders WHERE id=?", [orderId]);
    if (!order) return notFound();

    const isAdmin = a.user.role === "admin";
    if (!isAdmin && order.user_id !== a.user.id) return forbidden();

    const allowedStatus = new Set(["pending", "paid", "cancelled", "refunded"]);
    const nextStatus = String(body.status);
    if (!allowedStatus.has(nextStatus)) return badRequest("Invalid status");

    const paypal_order_id = body.paypal_order_id ? String(body.paypal_order_id) : null;
    const paypal_payment_id = body.paypal_payment_id ? String(body.paypal_payment_id) : null;

    const now = nowIso();
    await dbRun(
      env.DB,
      `UPDATE orders
     SET status=?,
         paypal_order_id=COALESCE(?, paypal_order_id),
         paypal_payment_id=COALESCE(?, paypal_payment_id),
         updated_at=?
     WHERE id=?`,
      [nextStatus, paypal_order_id, paypal_payment_id, now, orderId]
    );

    const updated = await dbFirst<any>(env.DB, "SELECT * FROM orders WHERE id=?", [orderId]);
    return json(updated);
  }


  // ---------- ADMIN ----------
  if (path.startsWith("/api/admin/")) {
    const a = await requireAuth(env, req);
    if (!a.ok) return a.resp;
    if (!requireAdmin(a.user)) return forbidden();

    if (req.method === "GET" && path === "/api/admin/overview") {
      const total = await dbFirst<{ c: number }>(env.DB, "SELECT COUNT(*) as c FROM users", []);
      const paid = await dbFirst<{ c: number }>(env.DB, "SELECT COUNT(*) as c FROM profiles WHERE has_paid=1", []);
      // 这里金额按你前端写死的规则估算（你也可以改成从 orders 聚合）
      const paidUsers = paid?.c ?? 0;
      const paidAmount = paidUsers * 1.98;

      const subs = await dbFirst<{ c: number }>(
        env.DB,
        "SELECT COUNT(*) as c FROM profiles WHERE subscription_type='recurring' AND subscription_expires_at IS NOT NULL",
        []
      );
      const subscriptionUsers = subs?.c ?? 0;
      const subscriptionAmount = subscriptionUsers * 29.99;

      return json({
        total_users: total?.c ?? 0,
        paid_users: paidUsers,
        paid_amount: paidAmount,
        subscription_users: subscriptionUsers,
        subscription_amount: subscriptionAmount,
      });
    }

    if (req.method === "GET" && path === "/api/admin/daily-stats") {
      const limit = toInt(url.searchParams.get("limit"), 30);
      const rows = await dbAll<any>(env.DB, "SELECT * FROM daily_stats ORDER BY stat_date DESC LIMIT ?", [limit]);
      return json(rows);
    }

    if (req.method === "GET" && path === "/api/admin/users") {
      const page = Math.max(1, toInt(url.searchParams.get("page"), 1));
      const pageSize = Math.max(1, Math.min(100, toInt(url.searchParams.get("pageSize"), 20)));
      const offset = (page - 1) * pageSize;

      const total = await dbFirst<{ c: number }>(env.DB, "SELECT COUNT(*) as c FROM profiles", []);
      const users = await dbAll<any>(
        env.DB,
        "SELECT * FROM profiles ORDER BY created_at DESC LIMIT ? OFFSET ?",
        [pageSize, offset]
      );

      return json({
        users,
        total: total?.c ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((total?.c ?? 0) / pageSize),
      });
    }

    if (req.method === "GET" && path === "/api/admin/refund-requests") {
      const status = url.searchParams.get("status");
      const rows = status
        ? await dbAll<any>(env.DB, "SELECT * FROM refund_requests WHERE status=? ORDER BY created_at DESC", [status])
        : await dbAll<any>(env.DB, "SELECT * FROM refund_requests ORDER BY created_at DESC", []);
      return json(rows);
    }

    const refundUpdate = path.match(/^\/api\/admin\/refund-requests\/(\d+)$/);
    if (req.method === "PATCH" && refundUpdate) {
      const id = toInt(refundUpdate[1], 0);
      const body = await readJson(req);
      if (!body?.status) return badRequest("Missing status");

      const now = nowIso();
      await dbRun(
        env.DB,
        "UPDATE refund_requests SET status=?, admin_notes=?, processed_at=?, updated_at=? WHERE id=?",
        [String(body.status), body.admin_notes ? String(body.admin_notes) : null, now, now, id]
      );
      const row = await dbFirst<any>(env.DB, "SELECT * FROM refund_requests WHERE id=?", [id]);
      return json(row);
    }

    // ---------- ADMIN: subscription plans ----------
    if (req.method === "GET" && path === "/api/admin/subscription-plans") {
      const rows = await dbAll<any>(
        env.DB,
        "SELECT * FROM subscription_plans ORDER BY created_at DESC",
        []
      );
      return json(rows);
    }

    if (req.method === "POST" && path === "/api/admin/subscription-plans") {
      const body = await readJson(req);
      if (!body?.name) return badRequest("Missing name");

      const now = nowIso();
      await dbRun(
        env.DB,
        `INSERT INTO subscription_plans(
      name, trial_price, trial_duration, trial_unit,
      recurring_price, recurring_duration, recurring_unit,
      paypal_plan_id, description, is_active, created_at, updated_at
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          String(body.name),
          Number(body.trial_price ?? 0),
          toInt(body.trial_duration, 0),
          String(body.trial_unit ?? "DAY"),
          Number(body.recurring_price ?? 0),
          toInt(body.recurring_duration, 0),
          String(body.recurring_unit ?? "MONTH"),
          body.paypal_plan_id ? String(body.paypal_plan_id) : null,
          JSON.stringify(body.description ?? []),
          body.is_active == null ? 1 : (body.is_active ? 1 : 0),
          now,
          now,
        ]
      );

      const id = (await dbFirst<{ id: number }>(env.DB, "SELECT last_insert_rowid() as id", []))!.id;
      const row = await dbFirst<any>(env.DB, "SELECT * FROM subscription_plans WHERE id=?", [id]);
      return json(row, { status: 201 });
    }

    const planIdMatchAdmin = path.match(/^\/api\/admin\/subscription-plans\/(\d+)$/);

    if (req.method === "PATCH" && planIdMatchAdmin) {
      const id = toInt(planIdMatchAdmin[1], 0);
      const body = await readJson(req);
      if (!body || typeof body !== "object") return badRequest("Invalid body");

      const now = nowIso();
      // 允许更新字段（白名单）
      const allowed = new Set([
        "name",
        "trial_price",
        "trial_duration",
        "trial_unit",
        "recurring_price",
        "recurring_duration",
        "recurring_unit",
        "paypal_plan_id",
        "description",
        "is_active",
      ]);

      // 动态拼 SQL（D1 支持）
      const sets: string[] = [];
      const vals: any[] = [];
      for (const [k, v] of Object.entries(body)) {
        if (!allowed.has(k)) continue;
        if (k === "description") {
          sets.push("description=?");
          vals.push(JSON.stringify(v ?? []));
          continue;
        }
        if (k === "is_active") {
          sets.push("is_active=?");
          vals.push(v ? 1 : 0);
          continue;
        }
        sets.push(`${k}=?`);
        vals.push(v);
      }

      sets.push("updated_at=?");
      vals.push(now);

      if (sets.length <= 1) return badRequest("No valid fields to update");

      vals.push(id);
      await dbRun(env.DB, `UPDATE subscription_plans SET ${sets.join(", ")} WHERE id=?`, vals);

      const row = await dbFirst<any>(env.DB, "SELECT * FROM subscription_plans WHERE id=?", [id]);
      return json(row);
    }

    if (req.method === "DELETE" && planIdMatchAdmin) {
      const id = toInt(planIdMatchAdmin[1], 0);
      await dbRun(env.DB, "DELETE FROM subscription_plans WHERE id=?", [id]);
      return json({ ok: true });
    }
    // ---------- ADMIN: payment gateway config ----------
    if (req.method === "GET" && path === "/api/admin/payment-gateway-config") {
      const row = await dbFirst<any>(
        env.DB,
        "SELECT * FROM payment_gateway_config ORDER BY id DESC LIMIT 1",
        []
      );
      return json(row);
    }

    const pgIdMatch = path.match(/^\/api\/admin\/payment-gateway-config\/(\d+)$/);

    if (req.method === "PATCH" && pgIdMatch) {
      const id = toInt(pgIdMatch[1], 0);
      const body = await readJson(req);
      if (!body || typeof body !== "object") return badRequest("Invalid body");

      const allowed = new Set(["gateway_name", "client_id", "secret_key", "is_active"]);
      const sets: string[] = [];
      const vals: any[] = [];

      for (const [k, v] of Object.entries(body)) {
        if (!allowed.has(k)) continue;
        if (k === "is_active") {
          sets.push("is_active=?");
          vals.push(v ? 1 : 0);
          continue;
        }
        sets.push(`${k}=?`);
        vals.push(v);
      }

      sets.push("updated_at=?");
      vals.push(nowIso());

      vals.push(id);

      await dbRun(env.DB, `UPDATE payment_gateway_config SET ${sets.join(", ")} WHERE id=?`, vals);

      const row = await dbFirst<any>(env.DB, "SELECT * FROM payment_gateway_config WHERE id=?", [id]);
      return json(row);
    }

  }

  return notFound();
}
