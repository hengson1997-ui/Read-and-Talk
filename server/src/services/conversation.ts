import { getDb, dbAll, dbGet, dbRun, saveDb } from '../db/index.js';
import { searchRelevantChunks, buildContext } from './rag.js';
import { chatCompletionStream, buildTeacherSystemPrompt } from './llm.js';
import { generateSpeech } from './tts.js';

export function createConversation(bookId: number, teacherId: number, title?: string) {
  const db = getDb();
  
  const result = dbRun(`
    INSERT INTO conversations (book_id, teacher_id, title)
    VALUES (?, ?, ?)
  `, [bookId, teacherId, title || '新对话']);
  
  return dbGet('SELECT * FROM conversations WHERE id = ?', [result.lastInsertRowid]);
}

export function getConversations(bookId?: number) {
  const db = getDb();
  
  if (bookId) {
    return dbAll('SELECT * FROM conversations WHERE book_id = ? ORDER BY created_at DESC', [bookId]);
  }
  
  return dbAll('SELECT * FROM conversations ORDER BY created_at DESC');
}

export function getConversationMessages(conversationId: number) {
  const db = getDb();
  return dbAll('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC', [conversationId]);
}

export function getTeacher(teacherId: number) {
  const db = getDb();
  return dbGet('SELECT * FROM teachers WHERE id = ?', [teacherId]);
}

export async function* sendMessageStream(
  conversationId: number,
  userMessage: string
): AsyncGenerator<{ type: 'text' | 'audio' | 'done'; content: string }> {
  const db = getDb();
  
  // 获取对话信息
  const conversation = dbGet('SELECT * FROM conversations WHERE id = ?', [conversationId]);
  if (!conversation) {
    throw new Error('Conversation not found');
  }
  
  // 获取书籍信息
  const book = dbGet('SELECT * FROM books WHERE id = ?', [conversation.book_id]);
  
  // 获取教师信息
  const teacher = conversation.teacher_id 
    ? getTeacher(conversation.teacher_id)
    : dbGet('SELECT * FROM teachers WHERE is_default = 1');
  
  // 保存用户消息
  dbRun(`
    INSERT INTO messages (conversation_id, role, content)
    VALUES (?, 'user', ?)
  `, [conversationId, userMessage]);
  saveDb();
  
  // 检索相关书籍内容
  const chunks = searchRelevantChunks(conversation.book_id, userMessage);
  const context = buildContext(chunks);
  
  // 构建消息历史
  const history = getConversationMessages(conversationId);
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = history.map((msg: any) => ({
    role: msg.role === 'teacher' ? 'assistant' as const : 'user' as const,
    content: msg.content,
  }));
  
  // 构建系统提示词
  const systemPrompt = buildTeacherSystemPrompt(
    book?.title || '未知书籍',
    teacher?.style || 'socratic',
    teacher?.tone || 'gentle',
    teacher?.max_length || 200,
    context,
    teacher?.custom_prompt
  );
  
  // 流式生成回复
  let fullResponse = '';
  
  for await (const chunk of chatCompletionStream([
    { role: 'system', content: systemPrompt },
    ...messages.slice(0, -1),
    { role: 'user', content: userMessage },
  ])) {
    fullResponse += chunk;
    yield { type: 'text', content: chunk };
  }
  
  // 保存教师回复
  const messageResult = dbRun(`
    INSERT INTO messages (conversation_id, role, content)
    VALUES (?, 'teacher', ?)
  `, [conversationId, fullResponse]);
  
  const messageId = messageResult.lastInsertRowid;
  
  // 生成语音
  try {
    const audioPath = await generateSpeech(fullResponse, messageId);
    dbRun('UPDATE messages SET audio_path = ? WHERE id = ?', [audioPath, messageId]);
    saveDb();
    yield { type: 'audio', content: audioPath };
  } catch (error) {
    console.error('Failed to generate audio:', error);
  }
  
  yield { type: 'done', content: '' };
}
