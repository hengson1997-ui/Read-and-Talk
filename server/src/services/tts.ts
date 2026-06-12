import OpenAI from 'openai';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { config } from '../config.js';
import { getTTSConfig } from './settings.js';

function getClient(): OpenAI {
  const ttsConfig = getTTSConfig();
  return new OpenAI({
    baseURL: ttsConfig.url.replace('/audio/speech', '').replace('/v1', '/v1'),
    apiKey: ttsConfig.apiKey,
  });
}

export async function generateSpeech(text: string, messageId: number): Promise<string> {
  const ttsConfig = getTTSConfig();

  // 检查是否启用 TTS
  if (!ttsConfig.enabled) {
    throw new Error('TTS is disabled');
  }

  const audioPath = join(config.audioCacheDir, `${messageId}.wav`);

  // 检查缓存
  if (existsSync(audioPath)) {
    return `/audio/${messageId}.wav`;
  }

  // 确保缓存目录存在
  mkdirSync(config.audioCacheDir, { recursive: true });

  try {
    const client = getClient();

    // 使用 OpenAI 兼容的 chat completions 接口调用 TTS
    const completion = await client.chat.completions.create({
      model: ttsConfig.model || 'mimo-v2.5-tts',
      messages: [
        {
          role: 'user',
          content: '用温和耐心的语气，像一位经验丰富的教师在引导学生思考。',
        },
        {
          role: 'assistant',
          content: text,
        },
      ],
      audio: {
        format: 'wav',
        voice: '冰糖',
      },
    } as any);

    // 解析返回的音频数据
    const message = completion.choices[0]?.message;
    const audioData = (message as any)?.audio?.data;

    if (audioData) {
      const audioBuffer = Buffer.from(audioData, 'base64');
      writeFileSync(audioPath, audioBuffer);
      return `/audio/${messageId}.wav`;
    }

    throw new Error('No audio data in response');
  } catch (error) {
    console.error('TTS generation failed:', error);
    throw new Error('Failed to generate speech');
  }
}
