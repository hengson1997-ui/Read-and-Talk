import { Router } from 'express';
import { getDb, dbAll, dbGet, dbRun, saveDb } from '../db/index.js';

export const teachersRouter = Router();

// 获取教师列表
teachersRouter.get('/', async (req, res) => {
  const db = await getDb();
  const teachers = dbAll('SELECT * FROM teachers ORDER BY is_default DESC, created_at DESC');
  res.json(teachers);
});

// 创建自定义教师
teachersRouter.post('/', async (req, res) => {
  try {
    const { name, style, tone, maxLength, customPrompt } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    
    const db = await getDb();
    const result = dbRun(`
      INSERT INTO teachers (name, style, tone, max_length, custom_prompt)
      VALUES (?, ?, ?, ?, ?)
    `, [name, style || 'socratic', tone || 'gentle', maxLength || 200, customPrompt || null]);
    
    saveDb();
    const teacher = dbGet('SELECT * FROM teachers WHERE id = ?', [result.lastInsertRowid]);
    res.json(teacher);
  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({ error: 'Failed to create teacher' });
  }
});

// 更新教师
teachersRouter.put('/:id', async (req, res) => {
  try {
    const { name, style, tone, maxLength, customPrompt } = req.body;
    const db = await getDb();
    
    dbRun(`
      UPDATE teachers
      SET name = COALESCE(?, name),
          style = COALESCE(?, style),
          tone = COALESCE(?, tone),
          max_length = COALESCE(?, max_length),
          custom_prompt = COALESCE(?, custom_prompt)
      WHERE id = ?
    `, [name, style, tone, maxLength, customPrompt, req.params.id]);
    
    saveDb();
    const teacher = dbGet('SELECT * FROM teachers WHERE id = ?', [req.params.id]);
    res.json(teacher);
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({ error: 'Failed to update teacher' });
  }
});

// 删除教师
teachersRouter.delete('/:id', async (req, res) => {
  const db = await getDb();
  dbRun('DELETE FROM teachers WHERE id = ? AND is_default = 0', [req.params.id]);
  saveDb();
  res.json({ success: true });
});
