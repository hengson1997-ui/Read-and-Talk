import OpenAI from 'openai';
import { config } from '../config.js';
import { getASRConfig } from './settings.js';

function getClient(): OpenAI {
  const asrConfig = getASRConfig();
  return new OpenAI({
    baseURL: asrConfig.url.replace('/audio/transcriptions', '').replace('/v1', '/v1'),
    apiKey: asrConfig.apiKey,
  });
}

export async function transcribeAudio(audioBuffer: Buffer, language: string = 'zh'): Promise<{ text: string }> {
  const asrConfig = getASRConfig();

  // 检查是否启用 ASR
  if (!asrConfig.enabled) {
    throw new Error('ASR is disabled');
  }

  try {
    const client = getClient();

    // 确定 MIME 类型
    const mimeType = 'audio/wav';
    const audioBase64 = audioBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${audioBase64}`;

    // 使用 OpenAI 兼容的 chat completions 接口调用 ASR
    const completion = await client.chat.completions.create({
      model: asrConfig.model || 'mimo-v2.5-asr',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'input_audio',
              input_audio: {
                data: dataUrl,
              },
            },
          ],
        },
      ],
      asr_options: {
        language: language,
      },
    } as any);

    const text = completion.choices[0]?.message?.content || '';
    return { text };
  } catch (error) {
    console.error('ASR transcription failed:', error);
    throw new Error('Failed to transcribe audio');
  }
}
