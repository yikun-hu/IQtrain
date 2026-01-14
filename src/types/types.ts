// 数据库类型定义

import { ITranslatedField } from "@/contexts/LanguageContext";

export type UserRole = 'user' | 'admin';
export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';
export type SubscriptionType = 'one_time' | 'monthly' | 'biweekly';
export type TestDimension = 'memory' | 'speed' | 'reaction' | 'concentration' | 'logic';
export type GameCategory = 'puzzles' | 'number_games' | 'memory_games' | 'logic_games';
export type TestType = 'iq' | 'career' | 'eq' | 'anxiety' | 'personality';
export type RefundStatus = 'pending' | 'approved' | 'rejected';
export type PaymentType = 'one_time' | 'subscription';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  age?: number;
  gender?: string;
  role: UserRole;
  has_paid: boolean;
  subscription_type?: SubscriptionType;
  subscription_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface IQQuestion {
  id: string;
  question_number: number;
  image_url: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  option_f: string;
  correct_answer: string;
  dimension: TestDimension;
  created_at: string;
}

export interface TestResult {
  id: string;
  user_id: string;
  answers: Record<number, string>; // {1: "A", 2: "B", ...}
  score: number;
  iq_score: number;
  dimension_scores: Record<TestDimension, number>;
  time_taken: number;
  test_type: string;
  completed_at: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_no: string;
  user_id: string;
  status: OrderStatus;
  subscription_type: SubscriptionType;
  subscription_plan_id: string;
  amount: number;
  paypal_order_id?: string;
  paypal_payment_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TrainingRecord {
  id: string;
  user_id: string;
  game_name: string;
  score?: number;
  duration?: number;
  completed_at: string;
  created_at: string;
}

// 游戏类型
export interface Game {
  id: string;
  title: ITranslatedField;
  category: GameCategory;
  url: string;
  description?: ITranslatedField;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

// 测试类型
export interface Test {
  id: string;
  title: string;
  type: TestType;
  description?: string;
  duration?: number; // 分钟
  question_count?: number;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

// 测试题目
export interface TestQuestion {
  id: string;
  test_id: string;
  question_number: number;
  question_text: string;
  question_text_zh: string;
  question_image?: string;
  options: string[]; // 选项数组
  correct_answer: string;
  dimension?: string;
  created_at: string;
}

// 用户测试结果
export interface UserTestResult {
  id: string;
  user_id: string;
  test_id: string;
  answers: Record<number, string>;
  score: number;
  result_data?: any; // 测试结果详细数据
  time_taken?: number;
  completed_at: string;
}

// 时间单位类型
export type TimeUnit = 'DAY' | 'MONTH' | 'WEEK' | 'YEAR';

// 订阅包类型
export interface SubscriptionPlan {
  id: string;
  name: string;
  trial_price: number;
  trial_duration: number;
  trial_unit: TimeUnit;
  recurring_price: number;
  recurring_duration: number;
  recurring_unit: TimeUnit;
  paypal_plan_id: string | null;
  description: ITranslatedField<string[]>; // bullet points数组
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 支付网关配置类型
export interface PaymentGatewayConfig {
  id: string;
  gateway_name: string;
  client_id: string;
  secret_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 语言类型
export type Language = 'en-US' | 'de-DE' | 'fr-FR' | 'zh-CN' | 'zh-TW';

// 测试答案类型
export interface TestAnswer {
  question_number: number;
  answer: string;
}

// 用户信息表单
export interface UserInfoForm {
  full_name: string;
  age: number;
  gender: string;
  selected_dimensions: TestDimension[];
}

// 每日统计数据
export interface DailyStats {
  id: string;
  stat_date: string;
  pv: number;
  uv: number;
  total_users: number;
  new_users: number;
  new_paid_users: number;
  new_paid_amount: number;
  new_subscription_users: number;
  new_subscription_amount: number;
  created_at: string;
  updated_at: string;
}

// 管理员统计总览
export interface AdminOverview {
  total_users: number;
  paid_users: number;
  paid_amount: number;
  subscription_users: number;
  subscription_amount: number;
}

// 量表测试类型
export type ScaleTestType = 'emotional_recognition' | 'stress_index';

// 量表测试题目
export interface ScaleTestQuestion {
  id: string;
  test_type: ScaleTestType;
  question_id: string;
  question_text: ITranslatedField;
  question_text_zh: string;
  reverse_scored: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// 量表评分规则
export interface ScaleScoringRule {
  id: string;
  test_type: ScaleTestType;
  level: number;
  score_min: number;
  score_max: number;
  label: ITranslatedField<string>;
  color: string;
  interpretation: ITranslatedField<string>;
  feedback: ITranslatedField<string>;
  ability_dimensions?: ITranslatedField<Record<string, number>>;
  created_at: string;
  updated_at: string;
}

// 量表测试配置
export interface ScaleTestConfig {
  id: string;
  test_type: ScaleTestType;
  name: ITranslatedField<string>;
  short_name: string;
  recommendations: ITranslatedField<string[]>;
  action_plan: ITranslatedField<string[]>;
  dimensions: ITranslatedField<Record<string, number>>;
  percentiles: number[];
  created_at: string;
  updated_at: string;
}

// 量表测试答案
export interface ScaleTestAnswer {
  question_id: string;
  score: number; // 1-5分
}

// 退款申请
export interface RefundRequest {
  id: string;
  email: string;
  user_id?: string;
  status: RefundStatus;
  reason?: string;
  amount?: number;
  payment_type?: PaymentType;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  admin_notes?: string;
}
