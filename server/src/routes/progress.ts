import { Router } from 'express';
import { getBookProgress, updateConceptProgress, getDashboardData, getLearningPath } from '../services/progress.js';

export const progressRouter = Router();

// 获取书籍学习进度
progressRouter.get('/:bookId', (req, res) => {
  const progress = getBookProgress(parseInt(req.params.bookId));
  res.json(progress);
});

// 获取进度仪表盘数据
progressRouter.get('/:bookId/dashboard', (req, res) => {
  const dashboard = getDashboardData(parseInt(req.params.bookId));
  res.json(dashboard);
});

// 更新概念掌握状态
progressRouter.put('/:bookId/concept/:conceptId', (req, res) => {
  try {
    const { status, score } = req.body;
    
    if (!status || score === undefined) {
      return res.status(400).json({ error: 'status and score are required' });
    }
    
    updateConceptProgress(
      parseInt(req.params.bookId),
      parseInt(req.params.conceptId),
      status,
      score
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// 获取智能学习路径推荐
progressRouter.get('/:bookId/path', (req, res) => {
  const path = getLearningPath(parseInt(req.params.bookId));
  res.json(path);
});
