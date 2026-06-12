import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from './config.js';
import { getDb, closeDb } from './db/index.js';
import { booksRouter } from './routes/books.js';
import { conversationsRouter } from './routes/conversations.js';
import { teachersRouter } from './routes/teachers.js';
import { progressRouter } from './routes/progress.js';
import { reviewRouter } from './routes/review.js';
import { notesRouter } from './routes/notes.js';
import { ttsRouter } from './routes/tts.js';
import { asrRouter } from './routes/asr.js';
import { settingsRouter } from './routes/settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件服务
app.use('/audio', express.static(config.audioCacheDir));

// 路由
app.use('/api/books', booksRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/teachers', teachersRouter);
app.use('/api/progress', progressRouter);
app.use('/api/review', reviewRouter);
app.use('/api/notes', notesRouter);
app.use('/api/tts', ttsRouter);
app.use('/api/asr', asrRouter);
app.use('/api/settings', settingsRouter);

// 健康检查
app.get('/api/health', async (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 生产环境：提供前端静态文件
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = join(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));

  // 所有非 API 路由返回前端 index.html
  app.get('*', (req, res) => {
    res.sendFile(join(clientDistPath, 'index.html'));
  });
}

// 启动服务器
const PORT = config.port;

async function start() {
  try {
    await getDb(); // 初始化数据库
    console.log('✅ Database initialized');
    
    app.listen(PORT, () => {
      console.log(`🚀 Read & Talk server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  closeDb();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDb();
  process.exit(0);
});
