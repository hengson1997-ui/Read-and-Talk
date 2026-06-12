import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  
  llm: {
    baseUrl: process.env.LLM_API_BASE_URL || 'http://localhost:11434/v1',
    apiKey: process.env.LLM_API_KEY || '',
    model: process.env.LLM_MODEL || 'gpt-4o',
  },
  
  tts: {
    url: process.env.TTS_API_URL || 'http://localhost:8080/tts',
    apiKey: process.env.TTS_API_KEY || '',
    model: process.env.TTS_MODEL || 'mimo-v2.5-tts',
  },
  
  asr: {
    url: process.env.ASR_API_URL || 'http://localhost:8080/asr',
    apiKey: process.env.ASR_API_KEY || '',
    model: process.env.ASR_MODEL || 'mimo-v2.5-asr',
  },
  
  uploadDir: join(__dirname, '../uploads'),
  audioCacheDir: join(__dirname, '../audio-cache'),
  dbPath: join(__dirname, '../data/randt.db'),
};
