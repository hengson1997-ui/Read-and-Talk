import { Router } from 'express';
import multer from 'multer';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config.js';
import { getDb, dbAll, dbGet, dbRun, saveDb } from '../db/index.js';
import { processBook } from '../services/bookProcessor.js';

const upload = multer({
  dest: config.uploadDir,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'));
    }
  },
});

export const booksRouter = Router();

// 上传书籍
booksRouter.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const title = req.body.title || req.file.originalname.replace(/\.[^.]+$/, '');
    const ext = req.file.originalname.split('.').pop();
    const newFilename = `${uuidv4()}.${ext}`;
    const newPath = join(config.uploadDir, newFilename);
    
    const fs = await import('fs/promises');
    await fs.rename(req.file.path, newPath);
    
    const db = await getDb();
    const result = dbRun(`
      INSERT INTO books (title, filename, file_path)
      VALUES (?, ?, ?)
    `, [title, req.file.originalname, newPath]);
    
    const bookId = result.lastInsertRowid;
    
    const chunkCount = await processBook(newPath, bookId);
    
    await extractConcepts(bookId, title);
    saveDb();
    
    res.json({
      id: bookId,
      title,
      filename: req.file.originalname,
      totalChunks: chunkCount,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload book' });
  }
});

// 获取书籍列表
booksRouter.get('/', async (req, res) => {
  const db = await getDb();
  const books = dbAll('SELECT * FROM books ORDER BY created_at DESC');
  res.json(books);
});

// 获取书籍详情
booksRouter.get('/:id', async (req, res) => {
  const db = await getDb();
  const book = dbGet('SELECT * FROM books WHERE id = ?', [req.params.id]);

  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const concepts = dbAll('SELECT * FROM concepts WHERE book_id = ?', [req.params.id]);
  const chapterSummaries = dbAll('SELECT * FROM chapter_summaries WHERE book_id = ?', [req.params.id]);

  // 解析 JSON 字段
  const parsedBook = {
    ...book,
    learning_focus: book.learning_focus ? JSON.parse(book.learning_focus) : [],
    concepts: concepts.map(c => ({
      ...c,
      related_concept_ids: c.related_concept_ids ? JSON.parse(c.related_concept_ids) : [],
    })),
    chapter_summaries: chapterSummaries.map(cs => ({
      ...cs,
      key_points: cs.key_points ? JSON.parse(cs.key_points) : [],
    })),
  };

  res.json(parsedBook);
});

// 删除书籍
booksRouter.delete('/:id', async (req, res) => {
  const db = await getDb();
  dbRun('DELETE FROM books WHERE id = ?', [req.params.id]);
  saveDb();
  res.json({ success: true });
});

async function extractConcepts(bookId: number, bookTitle: string) {
  const db = await getDb();
  
  const chunks = dbAll('SELECT content FROM book_chunks WHERE book_id = ? ORDER BY chunk_index', [bookId]);
  
  const keywords = extractKeywords(chunks.map((c: any) => c.content).join(' '));
  
  for (const keyword of keywords.slice(0, 20)) {
    dbRun(`
      INSERT INTO concepts (book_id, name, description, chapter)
      VALUES (?, ?, ?, ?)
    `, [bookId, keyword, `关于${keyword}的解释`, null]);
  }
}

function extractKeywords(text: string): string[] {
  const words = text.split(/[\s,，。！？、；：""''（）\[\]【】]+/).filter(w => w.length >= 2 && w.length <= 10);
  const wordCount: Record<string, number> = {};
  
  for (const word of words) {
    wordCount[word] = (wordCount[word] || 0) + 1;
  }
  
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}
