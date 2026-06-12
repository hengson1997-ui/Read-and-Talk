-- 书籍
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  total_chunks INTEGER DEFAULT 0,
  summary TEXT,
  learning_focus TEXT,
  suggestions TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 书籍分块
CREATE TABLE IF NOT EXISTS book_chunks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  chapter TEXT,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- 知识概念
CREATE TABLE IF NOT EXISTS concepts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  chapter TEXT,
  importance TEXT DEFAULT 'medium',
  related_concept_ids TEXT,
  mastery_level REAL DEFAULT 0,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- 章节摘要
CREATE TABLE IF NOT EXISTS chapter_summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  chapter TEXT NOT NULL,
  summary TEXT,
  key_points TEXT,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- 教师角色
CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  avatar TEXT,
  style TEXT NOT NULL DEFAULT 'socratic',
  tone TEXT NOT NULL DEFAULT 'gentle',
  max_length INTEGER DEFAULT 200,
  custom_prompt TEXT,
  is_default INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 对话
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  teacher_id INTEGER,
  title TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

-- 消息
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'teacher')),
  content TEXT NOT NULL,
  audio_path TEXT,
  concepts_discussed TEXT,
  understanding_score REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- 学习进度
CREATE TABLE IF NOT EXISTS learning_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  concept_id INTEGER NOT NULL,
  user_id TEXT DEFAULT 'default',
  status TEXT NOT NULL DEFAULT 'not_started',
  score REAL DEFAULT 0,
  last_reviewed_at DATETIME,
  next_review_at DATETIME,
  review_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE CASCADE
);

-- 笔记
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  conversation_id INTEGER,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- 复习记录
CREATE TABLE IF NOT EXISTS review_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  concept_id INTEGER NOT NULL,
  user_id TEXT DEFAULT 'default',
  score REAL NOT NULL,
  reviewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE CASCADE
);

-- 设置
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  llm_provider TEXT DEFAULT 'custom',
  llm_base_url TEXT DEFAULT 'http://localhost:11434/v1',
  llm_api_key TEXT DEFAULT '',
  llm_model TEXT DEFAULT 'gpt-4o',
  llm_max_tokens INTEGER DEFAULT 1000,
  llm_temperature REAL DEFAULT 0.7,
  tts_enabled INTEGER DEFAULT 1,
  tts_provider TEXT DEFAULT 'custom',
  tts_url TEXT DEFAULT 'http://localhost:8080/tts',
  tts_api_key TEXT DEFAULT '',
  tts_model TEXT DEFAULT 'mimo-v2.5-tts',
  tts_speed REAL DEFAULT 1.0,
  asr_enabled INTEGER DEFAULT 1,
  asr_provider TEXT DEFAULT 'custom',
  asr_url TEXT DEFAULT 'http://localhost:8080/asr',
  asr_api_key TEXT DEFAULT '',
  asr_model TEXT DEFAULT 'mimo-v2.5-asr',
  token_balance INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认教师
INSERT OR IGNORE INTO teachers (name, style, tone, max_length, is_default) VALUES
('苏格拉底老师', 'socratic', 'gentle', 200, 1);
INSERT OR IGNORE INTO teachers (name, style, tone, max_length, is_default) VALUES
('严谨学者', 'scholar', 'professional', 300, 0);
INSERT OR IGNORE INTO teachers (name, style, tone, max_length, is_default) VALUES
('幽默导师', 'humor', 'lively', 250, 0);
INSERT OR IGNORE INTO teachers (name, style, tone, max_length, is_default) VALUES
('实战专家', 'case', 'professional', 280, 0);
