import { getDb, dbAll, dbGet, dbRun, saveDb } from '../db/index.js';

export function getBookProgress(bookId: number, userId: string = 'default') {
  const db = getDb();
  return dbAll(`
    SELECT lp.*, c.name as concept_name, c.chapter
    FROM learning_progress lp
    JOIN concepts c ON lp.concept_id = c.id
    WHERE lp.book_id = ? AND lp.user_id = ?
  `, [bookId, userId]);
}

export function updateConceptProgress(
  bookId: number,
  conceptId: number,
  status: string,
  score: number,
  userId: string = 'default'
): void {
  const db = getDb();
  
  const existing = dbGet(`
    SELECT id FROM learning_progress
    WHERE book_id = ? AND concept_id = ? AND user_id = ?
  `, [bookId, conceptId, userId]);
  
  if (existing) {
    dbRun(`
      UPDATE learning_progress
      SET status = ?, score = ?, last_reviewed_at = CURRENT_TIMESTAMP,
          review_count = review_count + 1, updated_at = CURRENT_TIMESTAMP
      WHERE book_id = ? AND concept_id = ? AND user_id = ?
    `, [status, score, bookId, conceptId, userId]);
  } else {
    dbRun(`
      INSERT INTO learning_progress (book_id, concept_id, user_id, status, score, last_reviewed_at, review_count)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 1)
    `, [bookId, conceptId, userId, status, score]);
  }
  saveDb();
}

export function getDashboardData(bookId: number, userId: string = 'default') {
  const db = getDb();
  
  const totalConcepts = dbGet('SELECT COUNT(*) as count FROM concepts WHERE book_id = ?', [bookId]);
  
  const progressStats = dbAll(`
    SELECT status, COUNT(*) as count
    FROM learning_progress
    WHERE book_id = ? AND user_id = ?
    GROUP BY status
  `, [bookId, userId]);
  
  const chapterProgress = dbAll(`
    SELECT 
      c.chapter,
      COUNT(DISTINCT c.id) as total_concepts,
      COUNT(DISTINCT CASE WHEN lp.status = 'mastered' THEN c.id END) as mastered,
      COUNT(DISTINCT CASE WHEN lp.status = 'familiar' THEN c.id END) as familiar,
      COUNT(DISTINCT CASE WHEN lp.status = 'learning' THEN c.id END) as learning
    FROM concepts c
    LEFT JOIN learning_progress lp ON c.id = lp.concept_id AND lp.user_id = ?
    WHERE c.book_id = ?
    GROUP BY c.chapter
  `, [userId, bookId]);
  
  const learningTime = dbGet(`
    SELECT 
      COUNT(DISTINCT date(created_at)) as days,
      COUNT(*) as conversations
    FROM conversations
    WHERE book_id = ?
  `, [bookId]);
  
  return {
    totalConcepts: totalConcepts?.count || 0,
    progress: progressStats.reduce((acc: Record<string, number>, curr: any) => {
      acc[curr.status] = curr.count;
      return acc;
    }, {}),
    chapterProgress,
    learningTime,
  };
}

export function getLearningPath(bookId: number, userId: string = 'default') {
  const db = getDb();
  
  const concepts = dbAll(`
    SELECT 
      c.*,
      COALESCE(lp.status, 'not_started') as status,
      COALESCE(lp.score, 0) as score,
      lp.next_review_at
    FROM concepts c
    LEFT JOIN learning_progress lp ON c.id = lp.concept_id AND lp.user_id = ?
    WHERE c.book_id = ?
    ORDER BY c.chapter, c.id
  `, [userId, bookId]);
  
  const mastered = concepts.filter((c: any) => c.status === 'mastered');
  const learning = concepts.filter((c: any) => c.status === 'learning' || c.status === 'familiar');
  const notStarted = concepts.filter((c: any) => c.status === 'not_started');
  
  const recommended = [
    ...learning.slice(0, 3),
    ...notStarted.slice(0, 2),
  ];
  
  return {
    mastered: mastered.length,
    learning: learning.length,
    notStarted: notStarted.length,
    recommended,
  };
}
