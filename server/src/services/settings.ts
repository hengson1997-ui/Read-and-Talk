import { getDb, dbGet } from '../db/index.js';
import { AppSettings, DEFAULT_SETTINGS } from '../types/settings.js';

export function getAppSettings(): AppSettings {
  try {
    const db = getDb();
    const row = dbGet('SELECT * FROM settings WHERE id = 1');

    if (row) {
      return {
        llm: {
          provider: row.llm_provider || DEFAULT_SETTINGS.llm.provider,
          baseUrl: row.llm_base_url || DEFAULT_SETTINGS.llm.baseUrl,
          apiKey: row.llm_api_key || DEFAULT_SETTINGS.llm.apiKey,
          model: row.llm_model || DEFAULT_SETTINGS.llm.model,
          maxTokens: row.llm_max_tokens || DEFAULT_SETTINGS.llm.maxTokens,
          temperature: row.llm_temperature || DEFAULT_SETTINGS.llm.temperature,
        },
        tts: {
          enabled: row.tts_enabled === 1,
          provider: row.tts_provider || DEFAULT_SETTINGS.tts.provider,
          url: row.tts_url || DEFAULT_SETTINGS.tts.url,
          apiKey: row.tts_api_key || DEFAULT_SETTINGS.tts.apiKey,
          model: row.tts_model || DEFAULT_SETTINGS.tts.model,
          speed: row.tts_speed || DEFAULT_SETTINGS.tts.speed,
        },
        asr: {
          enabled: row.asr_enabled === 1,
          provider: row.asr_provider || DEFAULT_SETTINGS.asr.provider,
          url: row.asr_url || DEFAULT_SETTINGS.asr.url,
          apiKey: row.asr_api_key || DEFAULT_SETTINGS.asr.apiKey,
          model: row.asr_model || DEFAULT_SETTINGS.asr.model,
        },
        tokenBalance: row.token_balance || 0,
      };
    }
  } catch (error) {
    console.error('Failed to get settings:', error);
  }

  return DEFAULT_SETTINGS;
}

export function getLLMConfig() {
  const settings = getAppSettings();
  return settings.llm;
}

export function getTTSConfig() {
  const settings = getAppSettings();
  return settings.tts;
}

export function getASRConfig() {
  const settings = getAppSettings();
  return settings.asr;
}

export function deductTokens(amount: number): boolean {
  try {
    const db = getDb();
    const settings = getAppSettings();

    if (settings.tokenBalance < amount) {
      return false;
    }

    dbRun('UPDATE settings SET token_balance = token_balance - ? WHERE id = 1', [amount]);
    return true;
  } catch (error) {
    console.error('Failed to deduct tokens:', error);
    return false;
  }
}

function dbRun(sql: string, params: any[]) {
  const db = getDb();
  return db.run(sql, params);
}
