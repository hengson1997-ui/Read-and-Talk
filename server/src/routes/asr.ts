import { Router } from 'express';
import multer from 'multer';
import { transcribeAudio } from '../services/asr.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const asrRouter = Router();

// 语音转文字
asrRouter.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }
    
    const language = req.body.language || 'zh';
    const result = await transcribeAudio(req.file.buffer, language);
    
    res.json(result);
  } catch (error) {
    console.error('ASR error:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});
