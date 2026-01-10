-- 创建时间单位枚举
CREATE TYPE time_unit AS ENUM ('DAY', 'MONTH', 'WEEK', 'YEAR');

-- 创建订阅包表
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trial_price NUMERIC(10,2) NOT NULL,
  trial_duration INTEGER NOT NULL,
  trial_unit time_unit NOT NULL,
  recurring_price NUMERIC(10,2) NOT NULL,
  recurring_duration INTEGER NOT NULL,
  recurring_unit time_unit NOT NULL,
  paypal_plan_id TEXT,
  description JSONB NOT NULL DEFAULT '[]'::jsonb, -- 存储多个bullet points
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建支付网关配置表
CREATE TABLE payment_gateway_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_name TEXT NOT NULL DEFAULT 'PayPal',
  client_id TEXT NOT NULL,
  secret_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX idx_payment_gateway_config_active ON payment_gateway_config(is_active);

-- 插入默认的PayPal配置（占位符）
INSERT INTO payment_gateway_config (gateway_name, client_id, secret_key, is_active)
VALUES ('PayPal', 'YOUR_PAYPAL_CLIENT_ID', 'YOUR_PAYPAL_SECRET_KEY', true);

-- 插入示例订阅包
INSERT INTO subscription_plans (
  name, 
  trial_price, 
  trial_duration, 
  trial_unit,
  recurring_price,
  recurring_duration,
  recurring_unit,
  paypal_plan_id,
  description,
  is_active
) VALUES 
(
  '7天试用套餐',
  1.98,
  7,
  'DAY',
  28.80,
  1,
  'MONTH',
  'P-XXXXXXXXXXXXX',
  '["获得IQ分数并与名人比较", "了解你的强项、人格和职业倾向", "每周训练以提高你的认知能力", "访问所有测试和游戏"]'::jsonb,
  true
),
(
  '月度订阅套餐',
  0,
  0,
  'DAY',
  28.80,
  1,
  'MONTH',
  'P-YYYYYYYYYYYYY',
  '["完整IQ测试和分析", "个性化训练计划", "所有认知测试", "可打印证书"]'::jsonb,
  true
);

-- 添加RLS策略（仅管理员可以管理）
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_gateway_config ENABLE ROW LEVEL SECURITY;

-- 管理员可以查看和管理所有订阅包
CREATE POLICY "管理员可以查看所有订阅包" ON subscription_plans
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  );

CREATE POLICY "管理员可以插入订阅包" ON subscription_plans
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  );

CREATE POLICY "管理员可以更新订阅包" ON subscription_plans
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  );

CREATE POLICY "管理员可以删除订阅包" ON subscription_plans
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  );

-- 管理员可以查看和管理支付网关配置
CREATE POLICY "管理员可以查看支付网关配置" ON payment_gateway_config
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  );

CREATE POLICY "管理员可以更新支付网关配置" ON payment_gateway_config
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  );

-- 普通用户可以查看激活的订阅包（用于前端展示）
CREATE POLICY "用户可以查看激活的订阅包" ON subscription_plans
  FOR SELECT
  USING (is_active = true);