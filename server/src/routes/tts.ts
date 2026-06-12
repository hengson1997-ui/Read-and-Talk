import { Router } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';
import { config } from '../config.js';
import { getDb, dbGet } from '../db/index.js';

export const ttsRouter = Router();

// 获取消息的音频文件
ttsRouter.get('/:messageId', async (req, res) => {
  const messageId = req.params.messageId;
  const audioPath = join(config.audioCacheDir, `${messageId}.mp3`);
  
  if (existsSync(audioPath)) {
    res.sendFile(audioPath);
  } else {
    const db = await getDb();
    const message = dbGet('SELECT audio_path FROM messages WHERE id = ?', [messageId]);
    
    if (message?.audio_path) {
      const fullPath = join(process.cwd(), message.audio_path);
      if (existsSync(fullPath)) {
        res.sendFile(fullPath);
      } else {
        res.status(404).json({ error: 'Audio not found' });
      }
    } else {
      res.status(404).json({ error: 'Audio not found' });
    }
  }
});
