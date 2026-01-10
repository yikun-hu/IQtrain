// 数据库类型定义

export type UserRole = 'user' | 'admin';
export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';
export type SubscriptionType = 'one_time' | 'monthly';
export type TestDimension = 'memory' | 'speed' | 'reaction' | 'concentration' | 'logic';
export type GameCategory = 'puzzles' | 'number_games' | 'memory_games' | 'logic_games';
export type TestType = 'iq' | 'career' | 'eq' | 'anxiety' | 'personality';

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
  completed_at: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_no: string;
  user_id: string;
  status: OrderStatus;
  subscription_type: SubscriptionType;
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
  title: string;
  title_zh: string;
  category: GameCategory;
  url: string;
  description?: string;
  description_zh?: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

// 测试类型
export interface Test {
  id: string;
  title: string;
  title_zh: string;
  type: TestType;
  description?: string;
  description_zh?: string;
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

// 语言类型
export type Language = 'en' | 'zh';

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
