import { Router } from 'express';
import { getPendingReviews, startReview, submitReview, getReviewCalendar } from '../services/review.js';

export const reviewRouter = Router();

// 获取待复习概念
reviewRouter.get('/pending', (req, res) => {
  const reviews = getPendingReviews();
  res.json(reviews);
});

// 开始复习
reviewRouter.post('/start', (req, res) => {
  try {
    const { conceptId } = req.body;
    
    if (!conceptId) {
      return res.status(400).json({ error: 'conceptId is required' });
    }
    
    const review = startReview(conceptId);
    res.json(review);
  } catch (error) {
    console.error('Start review error:', error);
    res.status(500).json({ error: 'Failed to start review' });
  }
});

// 提交复习答案
reviewRouter.post('/submit', (req, res) => {
  try {
    const { conceptId, score } = req.body;
    
    if (!conceptId || score === undefined) {
      return res.status(400).json({ error: 'conceptId and score are required' });
    }
    
    const result = submitReview(conceptId, score);
    res.json(result);
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// 获取复习日历
reviewRouter.get('/calendar', (req, res) => {
  const calendar = getReviewCalendar();
  res.json(calendar);
});
