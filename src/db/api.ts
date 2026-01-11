import { supabase } from './supabase';
import type { Profile, IQQuestion, TestResult, Order, TrainingRecord, TestDimension, Game, Test, TestQuestion, UserTestResult, SubscriptionPlan, PaymentGatewayConfig } from '@/types/types';

// ==================== 用户相关 ====================

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (error) throw error;
  return data as Profile | null;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as Profile | null;
}

// 取消订阅
export async function cancelSubscription(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      subscription_type: null,
      subscription_expires_at: null,
    })
    .eq('id', userId)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as Profile | null;
}

// ==================== IQ测试题目相关 ====================

export async function getAllQuestions() {
  const { data, error } = await supabase
    .from('iq_questions')
    .select('*')
    .order('question_number');
  
  if (error) throw error;
  return Array.isArray(data) ? data as IQQuestion[] : [];
}

export async function getQuestionByNumber(questionNumber: number) {
  const { data, error } = await supabase
    .from('iq_questions')
    .select('*')
    .eq('question_number', questionNumber)
    .maybeSingle();
  
  if (error) throw error;
  return data as IQQuestion | null;
}

// ==================== 测试结果相关 ====================

export async function saveTestResult(result: Omit<TestResult, 'id' | 'created_at' | 'completed_at'>) {
  const { data, error } = await supabase
    .from('test_results')
    .insert(result)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as TestResult | null;
}

export async function getIQTestResults(userId: string) {
  const { data, error } = await supabase
    .from('test_results')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data as TestResult[] : [];
}

export async function getLatestTestResult(userId: string) {
  const { data, error } = await supabase
    .from('test_results')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) throw error;
  return data as TestResult | null;
}

// ==================== 订单相关 ====================
export async function createVerifiedOrder(userId: string, paypalOrderId: string, subscriptionPlanId: string) {
  const { data, error } = await supabase.functions.invoke('createVerifiedOrder', {
    body: {
      user_id: userId,
      paypal_order_id: paypalOrderId,
      subscription_plan_id: subscriptionPlanId,
    }
  })
  
  if (error) throw error;
  return data as Order | null;
}

export async function createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as Order | null;
}

export async function getOrder(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle();
  
  if (error) throw error;
  return data as Order | null;
}

export async function getOrderByOrderNo(orderNo: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_no', orderNo)
    .maybeSingle();
  
  if (error) throw error;
  return data as Order | null;
}

export async function getUserOrders(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data as Order[] : [];
}

export async function updateOrderStatus(orderId: string, status: Order['status'], paypalData?: { paypal_order_id?: string; paypal_payment_id?: string }) {
  const updates: any = { status };
  if (paypalData) {
    Object.assign(updates, paypalData);
  }
  
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as Order | null;
}

// ==================== 训练记录相关 ====================

export async function saveTrainingRecord(record: Omit<TrainingRecord, 'id' | 'created_at' | 'completed_at'>) {
  const { data, error } = await supabase
    .from('training_records')
    .insert(record)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as TrainingRecord | null;
}

export async function getUserTrainingRecords(userId: string, limit?: number) {
  let query = supabase
    .from('training_records')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return Array.isArray(data) ? data as TrainingRecord[] : [];
}

// ==================== 认证相关 ====================

export async function signInWithOTP(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });
  
  if (error) throw error;
  return data;
}

export async function verifyOTP(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ==================== 游戏相关 ====================

// 获取所有游戏
export async function getAllGames() {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data as Game[] : [];
}

// 按类别获取游戏
export async function getGamesByCategory(category: string) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data as Game[] : [];
}

// 随机获取指定数量的游戏
export async function getRandomGames(count: number = 3) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .limit(100); // 先获取所有游戏
  
  if (error) throw error;
  
  const games = Array.isArray(data) ? data as Game[] : [];
  
  // 随机打乱并返回指定数量
  const shuffled = games.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// ==================== 测试相关 ====================

// 获取所有测试类型
export async function getAllTests() {
  const { data, error } = await supabase
    .from('tests')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data as Test[] : [];
}

// 获取指定测试的题目
export async function getTestQuestions(testId: string) {
  const { data, error } = await supabase
    .from('test_questions')
    .select('*')
    .eq('test_id', testId)
    .order('question_number');
  
  if (error) throw error;
  return Array.isArray(data) ? data as TestQuestion[] : [];
}

// ==================== 管理员统计相关 ====================

// 获取统计总览
export async function getAdminOverview() {
  // 获取总用户数
  const { count: totalUsers, error: totalUsersError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  
  if (totalUsersError) throw totalUsersError;

  // 获取付费用户数和金额
  const { data: paidData, error: paidError } = await supabase
    .from('profiles')
    .select('has_paid')
    .eq('has_paid', true);
  
  if (paidError) throw paidError;
  
  const paidUsers = paidData?.length || 0;
  const paidAmount = paidUsers * 1.98; // 一次性付费金额

  // 获取订阅用户数和金额
  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from('profiles')
    .select('subscription_type, subscription_expires_at')
    .eq('subscription_type', 'recurring')
    .not('subscription_expires_at', 'is', null);
  
  if (subscriptionError) throw subscriptionError;
  
  const subscriptionUsers = subscriptionData?.length || 0;
  const subscriptionAmount = subscriptionUsers * 29.99; // 月度订阅金额

  return {
    total_users: totalUsers || 0,
    paid_users: paidUsers,
    paid_amount: paidAmount,
    subscription_users: subscriptionUsers,
    subscription_amount: subscriptionAmount,
  };
}

// 获取每日统计数据
export async function getDailyStats(limit: number = 30) {
  const { data, error } = await supabase
    .from('daily_stats')
    .select('*')
    .order('stat_date', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

// 获取用户列表（分页）
export async function getUserList(page: number = 1, pageSize: number = 20) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  
  if (error) throw error;
  
  return {
    users: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

// ==================== 订阅包管理 ====================

// 获取所有订阅包
export async function getAllSubscriptionPlans() {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data as SubscriptionPlan[] : [];
}

// 获取激活的订阅包
export async function getActiveSubscriptionPlans() {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data as SubscriptionPlan[] : [];
}

// 获取单个订阅包
export async function getSubscriptionPlan(id: string) {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data as SubscriptionPlan | null;
}

// 创建订阅包
export async function createSubscriptionPlan(plan: Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('subscription_plans')
    .insert(plan)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as SubscriptionPlan | null;
}

// 更新订阅包
export async function updateSubscriptionPlan(id: string, updates: Partial<SubscriptionPlan>) {
  const { data, error } = await supabase
    .from('subscription_plans')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as SubscriptionPlan | null;
}

// 删除订阅包
export async function deleteSubscriptionPlan(id: string) {
  const { error } = await supabase
    .from('subscription_plans')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ==================== 支付网关配置管理 ====================

// 获取支付网关配置
export async function getPaymentGatewayConfig() {
  const { data, error } = await supabase
    .from('payment_gateway_config')
    .select('*')
    .eq('is_active', true)
    .maybeSingle();
  
  if (error) throw error;
  return data as PaymentGatewayConfig | null;
}

// 更新支付网关配置
export async function updatePaymentGatewayConfig(id: string, updates: Partial<PaymentGatewayConfig>) {
  const { data, error } = await supabase
    .from('payment_gateway_config')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as PaymentGatewayConfig | null;
}
