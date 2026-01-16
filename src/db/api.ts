import type {
  Profile,
  IQQuestion,
  TestResult,
  Order,
  TrainingRecord,
  Test,
  SubscriptionPlan,
  PaymentGatewayConfig,
  Language,
  ScaleTestQuestion,
  ScaleScoringRule,
  ScaleTestConfig,
  ScaleTestType,
} from "@/types/types";

/**
 * Base fetch helper
 */
type ApiError = Error & { status?: number; data?: any };

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(init.headers as any),
  };

  // auto json for body objects
  const hasBody = init.body != null;
  const isForm = hasBody && (init.body instanceof FormData);

  if (!isForm) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  const res = await fetch(path, {
    ...init,
    headers,
    credentials: "include",
  });

  // try parse json; if html returned, this will fail -> we fallback to text
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const err: ApiError = new Error(
      (data && typeof data === "object" && data.error) ? data.error : `HTTP ${res.status}`
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data as T;
}

function qs(params: Record<string, any>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// ==================== 用户相关 ====================

export async function getCurrentUser() {
  const r = await apiFetch<{ user: any }>("/api/auth/me", { method: "GET" });
  return r.user;
}

export async function getProfile(_userId: string) {
  const r = await apiFetch<{ profile: Profile | null }>("/api/profile", { method: "GET" });
  return r.profile ?? null;
}

export async function updateProfile(_userId: string, updates: Partial<Profile>) {
  const r = await apiFetch<{ profile: Profile | null }>("/api/profile", {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return r.profile ?? null;
}

// 取消订阅
export async function cancelSubscription(_userId: string) {
  // 后端基于 session 识别用户，这里不需要 userId
  const r = await apiFetch<{ order: any; profile: any }>("/api/subscription/cancel", {
    method: "POST",
    body: JSON.stringify({}),
  });
  return r.profile as Profile | null;
}

// ==================== IQ测试题目相关 ====================

export async function getAllQuestions() {
  const r = await apiFetch<IQQuestion[]>("/api/iq-questions", { method: "GET" });
  return Array.isArray(r) ? r : [];
}

export async function getQuestionByNumber(questionNumber: number) {
  const r = await apiFetch<IQQuestion | null>(`/api/iq-questions/${questionNumber}`, { method: "GET" });
  return r ?? null;
}

// ==================== 测试结果相关 ====================

export async function saveTestResult(
  result: Omit<TestResult, "id" | "created_at" | "completed_at">
) {
  // 后端会覆盖/补齐 created_at/completed_at
  const r = await apiFetch<TestResult | null>("/api/test-results", {
    method: "POST",
    body: JSON.stringify(result),
  });
  return r ?? null;
}

export async function getTestResults(_userId: string, testType: string = "iq") {
  // 你原本注释掉了 test_type 过滤；这里提供参数可用
  const r = await apiFetch<TestResult[]>(
    `/api/test-results${qs({ test_type: testType || undefined })}`,
    { method: "GET" }
  );
  return Array.isArray(r) ? r : [];
}

export async function getLatestTestResult(_userId: string, testType: string = "iq") {
  const r = await apiFetch<TestResult | null>(
    `/api/test-results/latest${qs({ test_type: testType })}`,
    { method: "GET" }
  );
  return r ?? null;
}

// ==================== 订单相关 ====================

export async function createVerifiedOrder(userId: string, paypalOrderId: string, subscriptionPlanId: string) {
  // userId 对后端没用，但保留签名
  const r = await apiFetch<{ order: Order; profile: Profile }>(
    "/api/paypal/create-verified-order",
    {
      method: "POST",
      body: JSON.stringify({
        user_id: userId, // 兼容字段，后端会忽略并使用 session 的 user
        paypal_order_id: paypalOrderId,
        subscription_plan_id: Number(subscriptionPlanId),
      }),
    }
  );
  return (r as any).order as Order | null;
}

export async function createOrder(order: Omit<Order, "id" | "created_at" | "updated_at">) {
  const r = await apiFetch<Order | null>("/api/orders", {
    method: "POST",
    body: JSON.stringify(order),
  });
  return r ?? null;
}

export async function getOrder(orderId: string) {
  const r = await apiFetch<Order | null>(`/api/orders/${Number(orderId)}`, { method: "GET" });
  return r ?? null;
}

export async function getOrderByOrderNo(orderNo: string) {
  const r = await apiFetch<Order | null>(`/api/orders/by-order-no/${encodeURIComponent(orderNo)}`, {
    method: "GET",
  });
  return r ?? null;
}

export async function getUserOrders(_userId: string) {
  const r = await apiFetch<Order[]>("/api/orders", { method: "GET" });
  return Array.isArray(r) ? r : [];
}

export async function updateOrderStatus(
  orderId: string,
  status: Order["status"],
  paypalData?: { paypal_order_id?: string; paypal_payment_id?: string }
) {
  const r = await apiFetch<Order | null>(`/api/orders/${Number(orderId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
      ...(paypalData || {}),
    }),
  });
  return r ?? null;
}

// ==================== 训练记录相关 ====================

export async function saveTrainingRecord(record: Omit<TrainingRecord, "id" | "created_at" | "completed_at">) {
  await apiFetch<{ ok: true }>("/api/training-records", {
    method: "POST",
    body: JSON.stringify(record),
  });

  // 旧版返回插入行；新后端这里返回 ok。为了兼容类型：返回 null
  // 如果你希望返回插入行，我可以同时把后端改成返回 representation。
  return null as any as TrainingRecord | null;
}

export async function getUserTrainingRecords(_userId: string, limit?: number) {
  const r = await apiFetch<TrainingRecord[]>(`/api/training-records${qs({ limit })}`, { method: "GET" });
  return Array.isArray(r) ? r : [];
}

// ==================== 认证相关 ====================

export async function signInWithOTP(email: string, language: Language) {
  // supabase 返回 data；这里返回 {ok:true}
  const r = await apiFetch<{ ok: true }>("/api/auth/sign-in-otp", {
    method: "POST",
    body: JSON.stringify({ email, language }),
  });
  return r;
}

export async function verifyOTP(email: string, token: string) {
  const r = await apiFetch<{ user: any }>("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, token }),
  });
  return r;
}

export async function signOut() {
  const r = await apiFetch<{ ok: true }>("/api/auth/sign-out", {
    method: "POST",
    body: JSON.stringify({}),
  });
  return r;
}

// ==================== 游戏相关 ====================

// 获取所有游戏
export async function getAllGames() {
  const data = await apiFetch<any[]>("/api/games", { method: "GET" });

  // 规范化游戏数据：将 JSON 字符串解析为 ITranslatedField 对象（兼容你原逻辑）
  const normalizeGame = (game: any) => {
    const parseTranslatedField = (value: any): any => {
      if (typeof value === "object" && value !== null && !Array.isArray(value)) return value;

      if (typeof value === "string" && value.trim().startsWith("{")) {
        try {
          return JSON.parse(value);
        } catch {
          return { "en-US": value, "zh-CN": value };
        }
      }

      if (typeof value === "string") return { "en-US": value, "zh-CN": value };
      return { "en-US": "", "zh-CN": "" };
    };

    return {
      ...game,
      title: parseTranslatedField(game.title),
      description: game.description ? parseTranslatedField(game.description) : undefined,
    };
  };

  return Array.isArray(data) ? (data.map(normalizeGame) as any[]) : [];
}

// 按类别获取游戏
export async function getGamesByCategory(category: string) {
  const data = await apiFetch<any[]>(`/api/games/category/${encodeURIComponent(category)}`, { method: "GET" });
  return Array.isArray(data) ? (data as any[]) : [];
}

// 随机获取指定数量的游戏
export async function getRandomGames(count: number = 3) {
  const data = await apiFetch<any[]>(`/api/games/random${qs({ count })}`, { method: "GET" });

  const normalizeGame = (game: any) => {
    const parseTranslatedField = (value: any): any => {
      if (typeof value === "object" && value !== null && !Array.isArray(value)) return value;
      if (typeof value === "string" && value.trim().startsWith("{")) {
        try { return JSON.parse(value); } catch { return { "en-US": value, "zh-CN": value }; }
      }
      if (typeof value === "string") return { "en-US": value, "zh-CN": value };
      return { "en-US": "", "zh-CN": "" };
    };
    return {
      ...game,
      title: parseTranslatedField(game.title),
      description: game.description ? parseTranslatedField(game.description) : undefined,
    };
  };

  const normalized = Array.isArray(data) ? data.map(normalizeGame) : [];
  return normalized as any[];
}

// ==================== 测试相关 ====================

// 获取所有测试类型
export async function getAllTests() {
  const r = await apiFetch<Test[]>("/api/tests", { method: "GET" });
  return Array.isArray(r) ? r : [];
}

// ==================== 管理员统计相关 ====================

// 获取统计总览
export async function getAdminOverview() {
  const r = await apiFetch<any>("/api/admin/overview", { method: "GET" });
  return r;
}

// 获取每日统计数据
export async function getDailyStats(limit: number = 30) {
  const r = await apiFetch<any[]>(`/api/admin/daily-stats${qs({ limit })}`, { method: "GET" });
  return Array.isArray(r) ? r : [];
}

// 获取用户列表（分页）
export async function getUserList(page: number = 1, pageSize: number = 20) {
  const r = await apiFetch<any>(
    `/api/admin/users${qs({ page, pageSize })}`,
    { method: "GET" }
  );
  return r;
}

// ==================== 订阅包管理 ====================

// 获取所有订阅包（admin）
export async function getAllSubscriptionPlans() {
  const r = await apiFetch<SubscriptionPlan[]>("/api/admin/subscription-plans", { method: "GET" });
  return Array.isArray(r) ? r : [];
}

// 获取激活的订阅包
export async function getActiveSubscriptionPlans() {
  const r = await apiFetch<SubscriptionPlan[]>("/api/subscription-plans/active", { method: "GET" });
  return Array.isArray(r) ? r : [];
}

// 获取单个订阅包
export async function getSubscriptionPlan(id: string) {
  const r = await apiFetch<SubscriptionPlan | null>(`/api/subscription-plans/${Number(id)}`, { method: "GET" });
  return r ?? null;
}

// 创建订阅包（admin）
export async function createSubscriptionPlan(plan: Omit<SubscriptionPlan, "id" | "created_at" | "updated_at">) {
  const r = await apiFetch<SubscriptionPlan | null>("/api/admin/subscription-plans", {
    method: "POST",
    body: JSON.stringify(plan),
  });
  return r ?? null;
}

// 更新订阅包（admin）
export async function updateSubscriptionPlan(id: string, updates: Partial<SubscriptionPlan>) {
  const r = await apiFetch<SubscriptionPlan | null>(`/api/admin/subscription-plans/${Number(id)}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return r ?? null;
}

// 删除订阅包（admin）
export async function deleteSubscriptionPlan(id: string) {
  await apiFetch<{ ok: true }>(`/api/admin/subscription-plans/${Number(id)}`, {
    method: "DELETE",
  });
}

// ==================== 支付网关配置管理 ====================

// 获取支付网关配置（public safe）
export async function getPaymentGatewayConfig() {
  const r = await apiFetch<PaymentGatewayConfig | null>("/api/payment-gateway-config", { method: "GET" });
  return r ?? null;
}

// 更新支付网关配置（admin）
export async function updatePaymentGatewayConfig(id: string, updates: Partial<PaymentGatewayConfig>) {
  const r = await apiFetch<PaymentGatewayConfig | null>(
    `/api/admin/payment-gateway-config/${Number(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(updates),
    }
  );
  return r ?? null;
}

// ==================== 量表测试相关 ====================

// 获取量表测试题目
export async function getScaleTestQuestions(testType: ScaleTestType) {
  const r = await apiFetch<ScaleTestQuestion[]>(
    `/api/scale-test/questions${qs({ test_type: testType })}`,
    { method: "GET" }
  );
  return Array.isArray(r) ? r : [];
}

// 获取量表评分规则
export async function getScaleScoringRules(testType: ScaleTestType) {
  const r = await apiFetch<ScaleScoringRule[]>(
    `/api/scale-test/scoring-rules${qs({ test_type: testType })}`,
    { method: "GET" }
  );
  return Array.isArray(r) ? r : [];
}

// 根据分数获取对应的评分规则
export async function getScaleScoringRuleByScore(testType: ScaleTestType, score: number) {
  const r = await apiFetch<ScaleScoringRule | null>(
    `/api/scale-test/scoring-rule-by-score${qs({ test_type: testType, score })}`,
    { method: "GET" }
  );
  return r ?? null;
}

// 获取测试配置
export async function getScaleTestConfig(testType: ScaleTestType) {
  const r = await apiFetch<ScaleTestConfig | null>(
    `/api/scale-test/config${qs({ test_type: testType })}`,
    { method: "GET" }
  );
  return r ?? null;
}

// 保存量表测试结果（使用test_results表）
// 你原本前端直接 insert 到 test_results；现在走统一接口 /api/test-results
export async function saveScaleTestResult(
  userId: string,
  testType: ScaleTestType,
  answers: Record<string, number>,
  totalScore: number,
  level: number,
  percentile: number
) {
  const payload = {
    user_id: userId, // 后端忽略，使用 session user
    test_type: testType,
    answers,
    score: totalScore,
    iq_score: totalScore,
    dimension_scores: { level, percentile },
    time_taken: 0,
    completed_at: new Date().toISOString(),
  };

  const r = await apiFetch<any>("/api/test-results", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return r;
}

// 获取用户的量表测试结果
export async function getUserScaleTestResults(userId: string, testType?: ScaleTestType) {
  const r = await apiFetch<any[]>(
    `/api/test-results${qs({ test_type: testType })}`,
    { method: "GET" }
  );
  return r || [];
}

// 获取单个量表测试结果
// （后端目前没提供按 id 取单条的接口；这里给你两种选择：
// 1) 先拉列表再 find；2) 我可以补一个 /api/test-results/:id）
export async function getScaleTestResultById(resultId: string) {
  const all = await apiFetch<any[]>("/api/test-results", { method: "GET" });
  const idNum = Number(resultId);
  return (Array.isArray(all) ? all.find(x => Number(x.id) === idNum) : null) ?? null;
}

// 计算量表测试分数
export function calculateScaleTestScore(
  answers: Record<string, number>,
  questions: ScaleTestQuestion[]
): number {
  let totalScore = 0;

  questions.forEach((question: any) => {
    const answer = answers[question.question_id];
    if (answer !== undefined) {
      const reverse = Boolean(question.reverse_scored) || question.reverse_scored === 1;
      const score = reverse ? (6 - answer) : answer;
      totalScore += score;
    }
  });

  return totalScore;
}

// 计算百分位（简化版本）
export function calculatePercentile(score: number, maxScore: number): number {
  const percentage = (score / maxScore) * 100;

  if (percentage >= 95) return 98;
  if (percentage >= 85) return 90;
  if (percentage >= 75) return 80;
  if (percentage >= 65) return 70;
  if (percentage >= 55) return 60;
  if (percentage >= 45) return 50;
  if (percentage >= 35) return 40;
  if (percentage >= 25) return 30;
  if (percentage >= 15) return 20;
  return 10;
}

// ==================== 退款申请相关 ====================

// 提交退款申请
export async function submitRefundRequest(data: {
  email: string;
  reason?: string;
  amount?: number;
  payment_type?: "one_time" | "subscription";
}) {
  const r = await apiFetch<any>("/api/refund-requests", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return r;
}

// 获取用户的退款申请列表
// supabase 版按 email 查；现在后端按 session email 查更安全，这里仍保留签名
export async function getUserRefundRequests(_email: string) {
  const r = await apiFetch<any[]>("/api/refund-requests", { method: "GET" });
  return r;
}

// 获取单个退款申请（后端没单条接口：先拉全量后 find）
// 如果你想要我补单条接口，我也可以直接给你后端路由
export async function getRefundRequest(id: string) {
  const all = await apiFetch<any[]>("/api/refund-requests", { method: "GET" });
  const idNum = Number(id);
  return (Array.isArray(all) ? all.find(x => Number(x.id) === idNum) : null) ?? null;
}

// 管理员：获取所有退款申请
export async function getAllRefundRequests(status?: "pending" | "approved" | "rejected") {
  const r = await apiFetch<any[]>(
    `/api/admin/refund-requests${qs({ status })}`,
    { method: "GET" }
  );
  return r;
}

// 管理员：更新退款申请状态
export async function updateRefundRequestStatus(
  id: string,
  status: "pending" | "approved" | "rejected",
  adminNotes?: string
) {
  const r = await apiFetch<any>(`/api/admin/refund-requests/${Number(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status, admin_notes: adminNotes }),
  });
  return r;
}
