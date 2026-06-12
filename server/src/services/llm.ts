import OpenAI from 'openai';
import { getLLMConfig } from './settings.js';
import type { ChatMessage } from '../types.js';

function getClient(): OpenAI {
  const config = getLLMConfig();
  return new OpenAI({
    baseURL: config.baseUrl,
    apiKey: config.apiKey || 'dummy',
  });
}

export async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  const config = getLLMConfig();
  const client = getClient();

  const response = await client.chat.completions.create({
    model: config.model,
    messages,
    temperature: config.temperature,
    max_tokens: config.maxTokens,
  });

  return response.choices[0]?.message?.content || '';
}

export async function* chatCompletionStream(messages: ChatMessage[]): AsyncGenerator<string> {
  const config = getLLMConfig();
  const client = getClient();

  const response = await client.chat.completions.create({
    model: config.model,
    messages,
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    stream: true,
  });

  for await (const chunk of response) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

export function buildTeacherSystemPrompt(
  bookTitle: string,
  teacherStyle: string,
  teacherTone: string,
  maxLength: number,
  context: string,
  customPrompt?: string | null
): string {
  const styleDescriptions: Record<string, string> = {
    socratic: '苏格拉底式提问：通过提问引导学生自己发现答案，不直接给答案，而是引导思考',
    scholar: '严谨学者型：深入浅出地讲解概念，注重逻辑性和准确性，适当引用书中原文',
    humor: '幽默引导型：用生动有趣的类比和例子解释概念，让学习变得轻松愉快',
    case: '实战案例型：结合实际案例和应用场景，帮助学生理解抽象概念的实际意义',
  };

  const toneDescriptions: Record<string, string> = {
    gentle: '温和耐心，鼓励学生表达想法，即使回答错误也给予肯定',
    professional: '专业严谨，注重概念的准确定义和逻辑推导',
    lively: '活泼生动，使用丰富的语气词和表情，营造轻松的学习氛围',
  };

  let prompt = `你是一位经验丰富的教师，正在帮助学生深度理解《${bookTitle}》这本书。

你的教学风格：${styleDescriptions[teacherStyle] || styleDescriptions.socratic}
你的语气：${toneDescriptions[teacherTone] || toneDescriptions.gentle}

教学要求：
- 每次回复控制在 ${maxLength} 字以内，适合语音播放
- 回复要自然流畅，像真人对话
- 适当使用 Markdown 格式（如**加粗**强调重点）
- 当学生理解偏差时，用类比和例子纠正
- 鼓励学生用自己的话总结概念

当前对话中检索到的书籍相关内容：
${context}
`;

  if (customPrompt) {
    prompt += `\n额外要求：\n${customPrompt}`;
  }

  return prompt;
}
