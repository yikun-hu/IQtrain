-- 创建每日统计表
CREATE TABLE daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date DATE NOT NULL UNIQUE,
  pv INTEGER DEFAULT 0,
  uv INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  new_paid_users INTEGER DEFAULT 0,
  new_paid_amount DECIMAL(10, 2) DEFAULT 0,
  new_subscription_users INTEGER DEFAULT 0,
  new_subscription_amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_daily_stats_date ON daily_stats(stat_date DESC);

-- 添加注释
COMMENT ON TABLE daily_stats IS '每日统计数据表';
COMMENT ON COLUMN daily_stats.stat_date IS '统计日期';
COMMENT ON COLUMN daily_stats.pv IS '页面浏览量';
COMMENT ON COLUMN daily_stats.uv IS '独立访客数';
COMMENT ON COLUMN daily_stats.total_users IS '总用户数';
COMMENT ON COLUMN daily_stats.new_users IS '新增用户数';
COMMENT ON COLUMN daily_stats.new_paid_users IS '新增付费用户数';
COMMENT ON COLUMN daily_stats.new_paid_amount IS '新增付费金额';
COMMENT ON COLUMN daily_stats.new_subscription_users IS '新增订阅用户数';
COMMENT ON COLUMN daily_stats.new_subscription_amount IS '新增订阅金额';