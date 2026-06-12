import { Router } from 'express';
import { createConversation, getConversations, getConversationMessages, sendMessageStream } from '../services/conversation.js';

export const conversationsRouter = Router();

// 创建对话
conversationsRouter.post('/', (req, res) => {
  try {
    const { bookId, teacherId, title } = req.body;
    
    if (!bookId) {
      return res.status(400).json({ error: 'bookId is required' });
    }
    
    const conversation = createConversation(bookId, teacherId || 1, title);
    res.json(conversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// 获取对话列表
conversationsRouter.get('/', (req, res) => {
  const bookId = req.query.bookId ? parseInt(req.query.bookId as string) : undefined;
  const conversations = getConversations(bookId);
  res.json(conversations);
});

// 获取对话消息
conversationsRouter.get('/:id/messages', (req, res) => {
  const messages = getConversationMessages(parseInt(req.params.id));
  res.json(messages);
});

// 发送消息（SSE 流式响应）
conversationsRouter.post('/:id/messages', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    
    const conversationId = parseInt(req.params.id);
    
    for await (const chunk of sendMessageStream(conversationId, message)) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});
