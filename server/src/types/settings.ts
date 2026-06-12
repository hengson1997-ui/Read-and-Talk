export interface LLMSettings {
  provider: 'custom' | 'openai' | 'anthropic' | 'token';
  baseUrl: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface TTSSettings {
  enabled: boolean;
  provider: 'custom' | 'openai';
  url: string;
  apiKey: string;
  model: string;
  speed: number;
}

export interface ASRSettings {
  enabled: boolean;
  provider: 'custom' | 'openai';
  url: string;
  apiKey: string;
  model: string;
}

export interface AppSettings {
  llm: LLMSettings;
  tts: TTSSettings;
  asr: ASRSettings;
  tokenBalance?: number; // TOKEN 套餐余额
}

export const DEFAULT_SETTINGS: AppSettings = {
  llm: {
    provider: 'custom',
    baseUrl: 'http://localhost:11434/v1',
    apiKey: '',
    model: 'gpt-4o',
    maxTokens: 1000,
    temperature: 0.7,
  },
  tts: {
    enabled: true,
    provider: 'custom',
    url: 'http://localhost:8080/tts',
    apiKey: '',
    model: 'mimo-v2.5-tts',
    speed: 1.0,
  },
  asr: {
    enabled: true,
    provider: 'custom',
    url: 'http://localhost:8080/asr',
    apiKey: '',
    model: 'mimo-v2.5-asr',
  },
  tokenBalance: 0,
};
