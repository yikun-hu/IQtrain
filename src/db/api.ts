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
  const { data, error } = await supabase.functions.invoke('unsubscribe', {
    body: { userId },
  })
  
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

export async function getTestResults(userId: string, testType: string = 'iq') {
  const { data, error } = await supabase
    .from('test_results')
    .select('*')
    // .eq('test_type', testType)
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data as TestResult[] : [];
}

export async function getLatestTestResult(userId: string, testType: string = 'iq') {
  const { data, error } = await supabase
    .from('test_results')
    .select('*')
    .eq('user_id', userId)
    .eq('test_type', testType)
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
  
  // 规范化游戏数据：将 JSON 字符串解析为 ITranslatedField 对象
  const normalizeGame = (game: any): Game => {
    // 解析 JSON 字符串为 ITranslatedField 对象
    const parseTranslatedField = (value: any): any => {
      // 如果已经是对象，直接返回
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return value;
      }
      
      // 如果是 JSON 字符串，解析它
      if (typeof value === 'string' && value.trim().startsWith('{')) {
        try {
          return JSON.parse(value);
        } catch (e) {
          console.warn('Failed to parse JSON string:', value, e);
          // 解析失败，返回默认值
          return { 'en-US': value, 'zh-CN': value };
        }
      }
      
      // 如果是普通字符串，转换为对象格式
      if (typeof value === 'string') {
        return { 'en-US': value, 'zh-CN': value };
      }
      
      // 如果是 null 或 undefined，返回空对象
      return { 'en-US': '', 'zh-CN': '' };
    };
    
    return {
      ...game,
      title: parseTranslatedField(game.title),
      description: game.description ? parseTranslatedField(game.description) : undefined,
      // 保留 title_zh 和 description_zh 用于向后兼容（如果存在）
      title_zh: game.title_zh || '',
      description_zh: game.description_zh || '',
    };
  };
  
  return Array.isArray(data) ? data.map(normalizeGame) as Game[] : [];
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
  
  // 规范化游戏数据：将 JSON 字符串解析为 ITranslatedField 对象
  const normalizeGame = (game: any): Game => {
    // 解析 JSON 字符串为 ITranslatedField 对象
    const parseTranslatedField = (value: any): any => {
      // 如果已经是对象，直接返回
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return value;
      }
      
      // 如果是 JSON 字符串，解析它
      if (typeof value === 'string' && value.trim().startsWith('{')) {
        try {
          return JSON.parse(value);
        } catch (e) {
          console.warn('Failed to parse JSON string:', value, e);
          // 解析失败，返回默认值
          return { 'en-US': value, 'zh-CN': value };
        }
      }
      
      // 如果是普通字符串，转换为对象格式
      if (typeof value === 'string') {
        return { 'en-US': value, 'zh-CN': value };
      }
      
      // 如果是 null 或 undefined，返回空对象
      return { 'en-US': '', 'zh-CN': '' };
    };
    
    return {
      ...game,
      title: parseTranslatedField(game.title),
      description: game.description ? parseTranslatedField(game.description) : undefined,
      // 保留 title_zh 和 description_zh 用于向后兼容（如果存在）
      title_zh: game.title_zh || '',
      description_zh: game.description_zh || '',
    };
  };
  
  // 规范化并随机打乱
  const normalized = Array.isArray(data) ? data.map(normalizeGame) : [];
  const shuffled = [...normalized].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count) as Game[];
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

// ==================== 量表测试相关 ====================

import type { ScaleTestQuestion, ScaleScoringRule, ScaleTestConfig, ScaleTestType } from '@/types/types';

// 获取量表测试题目
export async function getScaleTestQuestions(testType: ScaleTestType) {
  const { data, error } = await supabase
    .from('scale_test_questions')
    .select('*')
    .eq('test_type', testType)
    .order('display_order', { ascending: true });
  
  if (error) throw error;
  return (data || []) as ScaleTestQuestion[];
}

// 获取量表评分规则
export async function getScaleScoringRules(testType: ScaleTestType, language: string = 'en-US') {
  const { data, error } = await supabase
    .from('scale_scoring_rules')
    .select('*')
    .eq('language', language)
    .eq('test_type', testType)
    .order('level', { ascending: true });
  
  if (error) throw error;
  return (data || []) as ScaleScoringRule[];
}

// 根据分数获取对应的评分规则
export async function getScaleScoringRuleByScore(testType: ScaleTestType, score: number, language: string = 'en-US') {
  const { data, error } = await supabase
    .from('scale_scoring_rules')
    .select('*')
    .eq('language', language)
    .eq('test_type', testType)
    .lte('score_min', score)
    .gte('score_max', score)
    .maybeSingle();
  
  if (error) throw error;
  return data as ScaleScoringRule | null;
}

// 获取测试配置
export async function getScaleTestConfig(testType: ScaleTestType, language: string = 'en-US') {
  const { data, error } = await supabase
    .from('scale_test_configs')
    .select('*')
    .eq('language', language)
    .eq('test_type', testType)
    .maybeSingle();
  
  if (error) throw error;
  return data as ScaleTestConfig | null;
}

// 保存量表测试结果（使用test_results表）
export async function saveScaleTestResult(
  userId: string,
  testType: ScaleTestType,
  answers: Record<string, number>,
  totalScore: number,
  level: number,
  percentile: number
) {
  const { data, error } = await supabase
    .from('test_results')
    .insert({
      user_id: userId,
      test_type: testType,
      answers,
      score: totalScore,
      iq_score: totalScore, // 复用iq_score字段存储总分
      dimension_scores: { level, percentile }, // 存储等级和百分位
      time_taken: 0,
      completed_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

// 获取用户的量表测试结果
export async function getUserScaleTestResults(userId: string, testType?: ScaleTestType) {
  let query = supabase
    .from('test_results')
    .select('*')
    .eq('user_id', userId)
    .not('test_type', 'is', null)
    .order('completed_at', { ascending: false });
  
  if (testType) {
    query = query.eq('test_type', testType);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
}

// 获取单个量表测试结果
export async function getScaleTestResultById(resultId: string) {
  const { data, error } = await supabase
    .from('test_results')
    .select('*')
    .eq('id', resultId)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

// 计算量表测试分数
export function calculateScaleTestScore(
  answers: Record<string, number>,
  questions: ScaleTestQuestion[]
): number {
  let totalScore = 0;
  
  questions.forEach((question) => {
    const answer = answers[question.question_id];
    if (answer !== undefined) {
      // 如果是反向计分题，需要反转分数 (1->5, 2->4, 3->3, 4->2, 5->1)
      const score = question.reverse_scored ? (6 - answer) : answer;
      totalScore += score;
    }
  });
  
  return totalScore;
}

// 计算百分位（简化版本，实际应该基于历史数据）
export function calculatePercentile(score: number, maxScore: number): number {
  // 简化计算：假设正态分布，平均分为60%
  const percentage = (score / maxScore) * 100;
  
  // 映射到百分位
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
