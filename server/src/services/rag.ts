import { getDb, dbAll, dbGet } from '../db/index.js';
import type { BookChunk } from '../types.js';

export function searchRelevantChunks(bookId: number, query: string, limit: number = 5): BookChunk[] {
  // 1. 先尝试匹配概念
  const conceptChunks = searchByConcepts(bookId, query);
  if (conceptChunks.length >= limit) {
    return conceptChunks.slice(0, limit);
  }

  // 2. 关键词搜索补充
  const keywords = query.split(/\s+/).filter(k => k.length > 1);

  if (keywords.length === 0) {
    return dbAll(`
      SELECT id, book_id, content, chunk_index, chapter
      FROM book_chunks
      WHERE book_id = ?
      ORDER BY chunk_index
      LIMIT ?
    `, [bookId, limit]) as BookChunk[];
  }

  // 构建 LIKE 条件
  const conditions = keywords.map(() => 'content LIKE ?').join(' OR ');
  const params = keywords.map(k => `%${k}%`);

  const keywordChunks = dbAll(`
    SELECT id, book_id, content, chunk_index, chapter
    FROM book_chunks
    WHERE book_id = ? AND (${conditions})
    LIMIT ?
  `, [bookId, ...params, limit]) as BookChunk[];

  // 合并结果，去重
  const allChunks = [...conceptChunks, ...keywordChunks];
  const seen = new Set<number>();
  const uniqueChunks: BookChunk[] = [];

  for (const chunk of allChunks) {
    if (!seen.has(chunk.id)) {
      seen.add(chunk.id);
      uniqueChunks.push(chunk);
    }
  }

  return uniqueChunks.slice(0, limit);
}

function searchByConcepts(bookId: number, query: string): BookChunk[] {
  // 查找与查询相关的概念
  const concepts = dbAll(`
    SELECT name, description FROM concepts
    WHERE book_id = ? AND (name LIKE ? OR description LIKE ?)
  `, [bookId, `%${query}%`, `%${query}%`]);

  if (concepts.length === 0) {
    return [];
  }

  // 查找包含这些概念的段落
  const conceptNames = concepts.map(c => c.name);
  const conditions = conceptNames.map(() => 'content LIKE ?').join(' OR ');
  const params = conceptNames.map(n => `%${n}%`);

  return dbAll(`
    SELECT id, book_id, content, chunk_index, chapter
    FROM book_chunks
    WHERE book_id = ? AND (${conditions})
    LIMIT 3
  `, [bookId, ...params]) as BookChunk[];
}

export function buildContext(chunks: BookChunk[]): string {
  if (chunks.length === 0) {
    return '暂无相关书籍内容。';
  }

  return chunks
    .map((chunk, i) => `[段落${i + 1}${chunk.chapter ? ` - ${chunk.chapter}` : ''}]\n${chunk.content}`)
    .join('\n\n');
}

export function getBookConcepts(bookId: number) {
  return dbAll(`
    SELECT * FROM concepts
    WHERE book_id = ?
    ORDER BY importance DESC, name
  `, [bookId]);
}

export function getChapterSummaries(bookId: number) {
  return dbAll(`
    SELECT * FROM chapter_summaries
    WHERE book_id = ?
    ORDER BY id
  `, [bookId]);
}
