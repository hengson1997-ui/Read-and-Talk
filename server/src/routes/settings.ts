import { Router } from 'express';
import { getDb, dbRun, dbGet, saveDb } from '../db/index.js';
import { AppSettings, DEFAULT_SETTINGS } from '../types/settings.js';

export const settingsRouter = Router();

// 获取设置
settingsRouter.get('/', async (req, res) => {
  try {
    const db = getDb();
    const row = dbGet('SELECT * FROM settings WHERE id = 1');

    if (row) {
      res.json({
        llm: {
          provider: row.llm_provider,
          baseUrl: row.llm_base_url,
          apiKey: row.llm_api_key,
          model: row.llm_model,
          maxTokens: row.llm_max_tokens,
          temperature: row.llm_temperature,
        },
        tts: {
          enabled: row.tts_enabled === 1,
          provider: row.tts_provider,
          url: row.tts_url,
          apiKey: row.tts_api_key,
          model: row.tts_model,
          speed: row.tts_speed,
        },
        asr: {
          enabled: row.asr_enabled === 1,
          provider: row.asr_provider,
          url: row.asr_url,
          apiKey: row.asr_api_key,
          model: row.asr_model,
        },
        tokenBalance: row.token_balance || 0,
      });
    } else {
      res.json(DEFAULT_SETTINGS);
    }
  } catch (error) {
    console.error('Failed to get settings:', error);
    res.json(DEFAULT_SETTINGS);
  }
});

// 保存设置
settingsRouter.post('/', async (req, res) => {
  try {
    const settings: AppSettings = req.body;
    const db = getDb();

    // 检查设置表是否存在
    dbRun(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        llm_provider TEXT DEFAULT 'custom',
        llm_base_url TEXT DEFAULT 'http://localhost:11434/v1',
        llm_api_key TEXT DEFAULT '',
        llm_model TEXT DEFAULT 'gpt-4o',
        llm_max_tokens INTEGER DEFAULT 1000,
        llm_temperature REAL DEFAULT 0.7,
        tts_enabled INTEGER DEFAULT 1,
        tts_provider TEXT DEFAULT 'custom',
        tts_url TEXT DEFAULT 'http://localhost:8080/tts',
        tts_api_key TEXT DEFAULT '',
        tts_model TEXT DEFAULT 'mimo-v2.5-tts',
        tts_speed REAL DEFAULT 1.0,
        asr_enabled INTEGER DEFAULT 1,
        asr_provider TEXT DEFAULT 'custom',
        asr_url TEXT DEFAULT 'http://localhost:8080/asr',
        asr_api_key TEXT DEFAULT '',
        asr_model TEXT DEFAULT 'mimo-v2.5-asr',
        token_balance INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 插入或更新设置
    dbRun(`
      INSERT OR REPLACE INTO settings (
        id, llm_provider, llm_base_url, llm_api_key, llm_model, llm_max_tokens, llm_temperature,
        tts_enabled, tts_provider, tts_url, tts_api_key, tts_model, tts_speed,
        asr_enabled, asr_provider, asr_url, asr_api_key, asr_model,
        token_balance, updated_at
      ) VALUES (
        1, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, CURRENT_TIMESTAMP
      )
    `, [
      settings.llm.provider, settings.llm.baseUrl, settings.llm.apiKey, settings.llm.model,
      settings.llm.maxTokens, settings.llm.temperature,
      settings.tts.enabled ? 1 : 0, settings.tts.provider, settings.tts.url, settings.tts.apiKey,
      settings.tts.model, settings.tts.speed,
      settings.asr.enabled ? 1 : 0, settings.asr.provider, settings.asr.url, settings.asr.apiKey,
      settings.asr.model,
      settings.tokenBalance || 0,
    ]);

    saveDb();
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// 测试 LLM 连接
settingsRouter.post('/test-llm', async (req, res) => {
  try {
    const { baseUrl, apiKey, model } = req.body;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      res.json({ success: true, message: '连接成功', data });
    } else {
      const error = await response.text();
      res.json({ success: false, message: `连接失败: ${response.status}`, error });
    }
  } catch (error: any) {
    res.json({ success: false, message: `连接错误: ${error.message}` });
  }
});

// 获取 TOKEN 套餐信息
settingsRouter.get('/token-balance', async (req, res) => {
  try {
    const db = getDb();
    const row = dbGet('SELECT token_balance FROM settings WHERE id = 1');
    res.json({ balance: row?.token_balance || 0 });
  } catch (error) {
    res.json({ balance: 0 });
  }
});
