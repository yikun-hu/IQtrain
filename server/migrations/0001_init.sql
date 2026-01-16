PRAGMA foreign_keys = ON;

-- ===================== auth =====================
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user', -- 'user' | 'admin'
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id INTEGER PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  age INTEGER,
  gender TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  has_paid INTEGER NOT NULL DEFAULT 0,
  subscription_type TEXT,
  subscription_expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS otp_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  language TEXT,
  expires_at INTEGER NOT NULL, -- epoch ms
  created_at INTEGER NOT NULL  -- epoch ms
);

CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL, -- epoch ms
  created_at INTEGER NOT NULL, -- epoch ms
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- ===================== domain tables =====================
CREATE TABLE IF NOT EXISTS iq_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_number INTEGER NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  option_e TEXT NOT NULL,
  option_f TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  dimension TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,          -- JSON string
  category TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,             -- JSON string
  thumbnail_url TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_games_category ON games(category);

CREATE TABLE IF NOT EXISTS tests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  title_zh TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  description_zh TEXT,
  duration INTEGER,
  question_count INTEGER,
  thumbnail_url TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_tests_type ON tests(type);

CREATE TABLE IF NOT EXISTS test_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  answers TEXT NOT NULL,          -- JSON string
  score INTEGER NOT NULL,
  iq_score INTEGER NOT NULL,
  dimension_scores TEXT NOT NULL, -- JSON string
  time_taken INTEGER NOT NULL,
  completed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  test_type TEXT NOT NULL DEFAULT 'iq',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_test_results_user ON test_results(user_id);

CREATE TABLE IF NOT EXISTS training_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  game_name TEXT NOT NULL,
  score INTEGER,
  duration INTEGER,
  completed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_training_user ON training_records(user_id);

-- orders
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_no TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending|paid|cancelled|refunded
  subscription_type TEXT NOT NULL,        -- one_time|monthly|recurring|biweekly
  amount REAL NOT NULL,
  paypal_order_id TEXT,
  paypal_payment_id TEXT,
  subscription_plan_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_plan ON orders(subscription_plan_id);

CREATE TABLE IF NOT EXISTS order_bills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  paypal_payment_id TEXT,
  paid_at TEXT,
  bill_start_at TEXT,
  bill_end_at TEXT,
  amount REAL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payment_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payment_gateway TEXT DEFAULT 'paypal',
  event_type TEXT,
  content TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS payment_gateway_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gateway_name TEXT NOT NULL DEFAULT 'PayPal',
  client_id TEXT NOT NULL,
  secret_key TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_pg_active ON payment_gateway_config(is_active);

CREATE TABLE IF NOT EXISTS subscription_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  trial_price REAL NOT NULL,
  trial_duration INTEGER NOT NULL,
  trial_unit TEXT NOT NULL, -- DAY|WEEK|MONTH|YEAR
  recurring_price REAL NOT NULL,
  recurring_duration INTEGER NOT NULL,
  recurring_unit TEXT NOT NULL,
  paypal_plan_id TEXT,
  description TEXT NOT NULL DEFAULT '[]', -- JSON
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_plans_active ON subscription_plans(is_active);

CREATE TABLE IF NOT EXISTS scale_test_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  test_type TEXT NOT NULL,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL, -- JSON
  reverse_scored INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_scale_q_type ON scale_test_questions(test_type);

CREATE TABLE IF NOT EXISTS scale_scoring_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  test_type TEXT NOT NULL,
  level INTEGER NOT NULL,
  score_min INTEGER NOT NULL,
  score_max INTEGER NOT NULL,
  ability_dimensions TEXT, -- JSON
  label TEXT,              -- JSON
  interpretation TEXT,     -- JSON
  feedback TEXT,           -- JSON
  language TEXT NOT NULL DEFAULT 'en',
  color TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_scale_rules_type ON scale_scoring_rules(test_type);

CREATE TABLE IF NOT EXISTS scale_test_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  test_type TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,        -- JSON
  short_name TEXT NOT NULL,
  recommendations TEXT,      -- JSON
  action_plan TEXT,          -- JSON
  dimensions TEXT,           -- JSON
  percentiles TEXT,          -- JSON array
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS refund_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  user_id INTEGER,
  status TEXT NOT NULL DEFAULT 'pending', -- pending|approved|rejected
  reason TEXT,
  amount REAL,
  payment_type TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  processed_at TEXT,
  admin_notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_refund_email ON refund_requests(email);
CREATE INDEX IF NOT EXISTS idx_refund_status ON refund_requests(status);

CREATE TABLE IF NOT EXISTS daily_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stat_date TEXT NOT NULL UNIQUE, -- YYYY-MM-DD
  pv INTEGER NOT NULL DEFAULT 0,
  uv INTEGER NOT NULL DEFAULT 0,
  total_users INTEGER NOT NULL DEFAULT 0,
  new_users INTEGER NOT NULL DEFAULT 0,
  new_paid_users INTEGER NOT NULL DEFAULT 0,
  new_paid_amount REAL NOT NULL DEFAULT 0,
  new_subscription_users INTEGER NOT NULL DEFAULT 0,
  new_subscription_amount REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
