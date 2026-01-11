-- 创建游戏表
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_zh TEXT NOT NULL,
  category TEXT NOT NULL, -- 游戏类型：puzzles, number_games, memory_games, logic_games等
  url TEXT NOT NULL, -- HTML5游戏链接
  description TEXT,
  description_zh TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建测试类型表
CREATE TABLE IF NOT EXISTS tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_zh TEXT NOT NULL,
  type TEXT NOT NULL, -- 测试类型：iq, career, eq, anxiety等
  description TEXT,
  description_zh TEXT,
  duration INTEGER, -- 测试时长（分钟）
  question_count INTEGER, -- 题目数量
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建测试题目表
CREATE TABLE IF NOT EXISTS test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_text_zh TEXT NOT NULL,
  question_image TEXT,
  options JSONB NOT NULL, -- 选项数组
  correct_answer TEXT NOT NULL,
  dimension TEXT, -- 测试维度（可选）
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 创建索引
CREATE INDEX IF NOT EXISTS idx_games_category ON games(category);
CREATE INDEX IF NOT EXISTS idx_tests_type ON tests(type);
CREATE INDEX IF NOT EXISTS idx_test_questions_test_id ON test_questions(test_id);

-- 插入示例游戏数据
INSERT INTO games (title, title_zh, category, url, description, description_zh, thumbnail_url) VALUES
('2048', '2048', 'number_games', 'https://play2048.co/', 'Classic 2048 puzzle game', '经典2048数字游戏', 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=400'),
('Sudoku', '数独', 'puzzles', 'https://sudoku.com/', 'Classic Sudoku puzzle', '经典数独游戏', 'https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=400'),
('Memory Match', '记忆配对', 'memory_games', 'https://www.memozor.com/memory-games', 'Test your memory skills', '测试你的记忆力', 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400'),
('Chess', '国际象棋', 'logic_games', 'https://www.chess.com/play/computer', 'Play chess online', '在线下棋', 'https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=400'),
('Tetris', '俄罗斯方块', 'puzzles', 'https://tetris.com/play-tetris', 'Classic Tetris game', '经典俄罗斯方块', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400'),
('Math Quiz', '数学测验', 'number_games', 'https://www.mathplayground.com/', 'Improve your math skills', '提升数学能力', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400'),
('Word Search', '找字游戏', 'puzzles', 'https://thewordsearch.com/puzzle/', 'Find hidden words', '寻找隐藏的单词', 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=400'),
('Simon Says', '西蒙说', 'memory_games', 'https://www.freesimon.org/', 'Memory sequence game', '记忆序列游戏', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400');

-- 插入测试类型数据
INSERT INTO tests (title, title_zh, type, description, description_zh, duration, question_count) VALUES
('IQ Test', 'IQ测试', 'iq', 'Measure your intelligence quotient', '测量你的智商', 20, 20),
('Career Match Test', '职业匹配测试', 'career', 'Find your ideal career path', '找到你的理想职业道路', 15, 30),
('EQ Test', '情商测试', 'eq', 'Assess your emotional intelligence', '评估你的情商', 15, 25),
('Anxiety Level Test', '焦虑水平测试', 'anxiety', 'Evaluate your anxiety levels', '评估你的焦虑水平', 10, 20),
('Personality Test', '人格测试', 'personality', 'Discover your personality type', '发现你的人格类型', 20, 40);

-- 设置RLS策略
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;

-- 游戏表：所有人可读
CREATE POLICY "Games are viewable by everyone" ON games FOR SELECT USING (true);

-- 测试表：所有人可读
CREATE POLICY "Tests are viewable by everyone" ON tests FOR SELECT USING (true);

-- 测试题目表：所有人可读
CREATE POLICY "Test questions are viewable by everyone" ON test_questions FOR SELECT USING (true);
