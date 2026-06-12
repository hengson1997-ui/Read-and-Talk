import { Router } from 'express';
import { getDb, dbAll, dbGet, dbRun, saveDb } from '../db/index.js';

export const notesRouter = Router();

// 获取书籍笔记列表
notesRouter.get('/:bookId', async (req, res) => {
  const db = await getDb();
  const notes = dbAll(`
    SELECT * FROM notes 
    WHERE book_id = ? 
    ORDER BY updated_at DESC
  `, [req.params.bookId]);
  res.json(notes);
});

// 创建笔记
notesRouter.post('/', async (req, res) => {
  try {
    const { bookId, conversationId, content } = req.body;
    
    if (!bookId || !content) {
      return res.status(400).json({ error: 'bookId and content are required' });
    }
    
    const db = await getDb();
    const result = dbRun(`
      INSERT INTO notes (book_id, conversation_id, content)
      VALUES (?, ?, ?)
    `, [bookId, conversationId || null, content]);
    
    saveDb();
    const note = dbGet('SELECT * FROM notes WHERE id = ?', [result.lastInsertRowid]);
    res.json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// 更新笔记
notesRouter.put('/:id', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }
    
    const db = await getDb();
    dbRun(`
      UPDATE notes
      SET content = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [content, req.params.id]);
    
    saveDb();
    const note = dbGet('SELECT * FROM notes WHERE id = ?', [req.params.id]);
    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// 删除笔记
notesRouter.delete('/:id', async (req, res) => {
  const db = await getDb();
  dbRun('DELETE FROM notes WHERE id = ?', [req.params.id]);
  saveDb();
  res.json({ success: true });
});
