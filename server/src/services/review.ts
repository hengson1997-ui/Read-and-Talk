import { getDb, dbAll, dbGet, dbRun, saveDb } from '../db/index.js';

// 遗忘曲线间隔（天数）
const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60];

export function getPendingReviews(userId: string = 'default') {
  const db = getDb();
  
  return dbAll(`
    SELECT 
      c.*,
      lp.last_reviewed_at,
      lp.next_review_at,
      lp.review_count,
      lp.status
    FROM concepts c
    JOIN learning_progress lp ON c.id = lp.concept_id
    WHERE lp.user_id = ? 
      AND lp.status IN ('learning', 'familiar')
      AND (lp.next_review_at IS NULL OR lp.next_review_at <= datetime('now'))
    ORDER BY lp.next_review_at ASC
  `, [userId]);
}

export function startReview(conceptId: number) {
  const db = getDb();
  
  const concept = dbGet('SELECT * FROM concepts WHERE id = ?', [conceptId]);
  if (!concept) {
    throw new Error('Concept not found');
  }
  
  const question = generateReviewQuestion(concept);
  
  return { concept, question };
}

export function submitReview(conceptId: number, score: number, userId: string = 'default') {
  const db = getDb();
  
  const progress = dbGet(`
    SELECT * FROM learning_progress
    WHERE concept_id = ? AND user_id = ?
  `, [conceptId, userId]);
  
  const reviewCount = progress?.review_count || 0;
  
  let nextReviewAt: string | null = null;
  let newStatus = 'learning';
  
  if (score >= 0.8) {
    if (reviewCount < REVIEW_INTERVALS.length) {
      const days = REVIEW_INTERVALS[reviewCount];
      nextReviewAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    }
    newStatus = reviewCount >= 3 ? 'mastered' : 'familiar';
  } else if (score >= 0.5) {
    nextReviewAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    newStatus = 'learning';
  } else {
    nextReviewAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString();
    newStatus = 'learning';
  }
  
  if (progress) {
    dbRun(`
      UPDATE learning_progress
      SET score = ?, status = ?, next_review_at = ?, 
          last_reviewed_at = CURRENT_TIMESTAMP, review_count = review_count + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE concept_id = ? AND user_id = ?
    `, [score, newStatus, nextReviewAt, conceptId, userId]);
  } else {
    // 获取 book_id
    const conceptInfo = dbGet('SELECT book_id FROM concepts WHERE id = ?', [conceptId]);
    dbRun(`
      INSERT INTO learning_progress (book_id, concept_id, user_id, status, score, next_review_at, last_reviewed_at, review_count)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 1)
    `, [conceptInfo?.book_id, conceptId, userId, newStatus, score, nextReviewAt]);
  }
  
  dbRun(`
    INSERT INTO review_history (concept_id, user_id, score)
    VALUES (?, ?, ?)
  `, [conceptId, userId, score]);
  
  saveDb();
  
  return {
    nextReviewAt,
    newStatus,
    reviewCount: reviewCount + 1,
  };
}

function generateReviewQuestion(concept: any): string {
  const questions = [
    `请用自己的话解释一下"${concept.name}"这个概念。`,
    `"${concept.name}"的核心要点是什么？`,
    `为什么"${concept.name}"在书中很重要？`,
    `你能举一个"${concept.name}"的例子吗？`,
    `"${concept.name}"和相关概念有什么区别？`,
  ];
  
  return questions[Math.floor(Math.random() * questions.length)];
}

export function getReviewCalendar(userId: string = 'default') {
  const db = getDb();
  
  return dbAll(`
    SELECT 
      date(next_review_at) as review_date,
      COUNT(*) as concept_count
    FROM learning_progress
    WHERE user_id = ? 
      AND next_review_at IS NOT NULL
      AND next_review_at >= date('now')
    GROUP BY date(next_review_at)
    ORDER BY review_date
  `, [userId]);
}
