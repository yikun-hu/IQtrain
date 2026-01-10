-- 创建用户角色枚举
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- 创建订单状态枚举
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'cancelled', 'refunded');

-- 创建订阅类型枚举
CREATE TYPE subscription_type AS ENUM ('one_time', 'monthly');

-- 创建用户档案表
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  age INTEGER,
  gender TEXT,
  role user_role NOT NULL DEFAULT 'user'::user_role,
  has_paid BOOLEAN DEFAULT FALSE,
  subscription_type subscription_type,
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建IQ测试题目表
CREATE TABLE iq_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_number INTEGER NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  option_e TEXT NOT NULL,
  option_f TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  dimension TEXT NOT NULL, -- memory, speed, reaction, concentration, logic
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建测试结果表
CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  answers JSONB NOT NULL, -- 存储用户的答案 {1: "A", 2: "B", ...}
  score INTEGER NOT NULL,
  iq_score INTEGER NOT NULL,
  dimension_scores JSONB NOT NULL, -- 存储各维度得分 {memory: 80, speed: 90, ...}
  time_taken INTEGER NOT NULL, -- 测试用时（秒）
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建订单表
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status order_status NOT NULL DEFAULT 'pending'::order_status,
  subscription_type subscription_type NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  paypal_order_id TEXT,
  paypal_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建训练记录表
CREATE TABLE training_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_name TEXT NOT NULL,
  score INTEGER,
  duration INTEGER, -- 训练时长（秒）
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_test_results_user_id ON test_results(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_no ON orders(order_no);
CREATE INDEX idx_training_records_user_id ON training_records(user_id);

-- 创建触发器函数：用户确认后自动创建profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count INT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  INSERT INTO profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'user'::user_role END
  );
  RETURN NEW;
END;
$$;

-- 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 为需要的表添加更新时间触发器
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 启用RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE iq_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;

-- 创建辅助函数检查是否为管理员
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'::user_role
  );
$$;

-- Profiles RLS策略
CREATE POLICY "用户可以查看自己的profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "用户可以更新自己的profile（除role外）" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "管理员可以查看所有profiles" ON profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "管理员可以更新所有profiles" ON profiles
  FOR UPDATE USING (is_admin());

-- IQ Questions RLS策略（所有人可读）
CREATE POLICY "所有人可以查看IQ题目" ON iq_questions
  FOR SELECT USING (true);

CREATE POLICY "管理员可以管理IQ题目" ON iq_questions
  FOR ALL USING (is_admin());

-- Test Results RLS策略
CREATE POLICY "用户可以查看自己的测试结果" ON test_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建自己的测试结果" ON test_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "管理员可以查看所有测试结果" ON test_results
  FOR SELECT USING (is_admin());

-- Orders RLS策略
CREATE POLICY "用户可以查看自己的订单" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建自己的订单" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "管理员可以查看所有订单" ON orders
  FOR SELECT USING (is_admin());

-- Training Records RLS策略
CREATE POLICY "用户可以查看自己的训练记录" ON training_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建自己的训练记录" ON training_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "管理员可以查看所有训练记录" ON training_records
  FOR SELECT USING (is_admin());