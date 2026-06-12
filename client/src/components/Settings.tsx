import { useState, useEffect } from 'react';
import { X, Settings as SettingsIcon, Check, Loader2, Eye, EyeOff, Zap, Key, Globe, Cpu } from 'lucide-react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LLMSettings {
  provider: 'custom' | 'openai' | 'anthropic' | 'token';
  baseUrl: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

interface TTSSettings {
  enabled: boolean;
  provider: 'custom' | 'openai';
  url: string;
  apiKey: string;
  model: string;
  speed: number;
}

interface ASRSettings {
  enabled: boolean;
  provider: 'custom' | 'openai';
  url: string;
  apiKey: string;
  model: string;
}

interface AppSettings {
  llm: LLMSettings;
  tts: TTSSettings;
  asr: ASRSettings;
  tokenBalance?: number;
}

const PROVIDERS = [
  { value: 'custom', label: '自定义 API', icon: Globe },
  { value: 'openai', label: 'OpenAI', icon: Cpu },
  { value: 'anthropic', label: 'Anthropic', icon: Cpu },
  { value: 'token', label: 'TOKEN 套餐', icon: Zap },
];

const MODELS = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
  custom: ['gpt-4o', 'llama3', 'mistral', 'qwen2'],
  token: ['gpt-4o', 'gpt-4o-mini'],
};

export function Settings({ isOpen, onClose }: SettingsProps) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [activeTab, setActiveTab] = useState<'llm' | 'tts' | 'asr' | 'token'>('llm');

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTestLLM = async () => {
    if (!settings) return;

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/settings/test-llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: settings.llm.baseUrl,
          apiKey: settings.llm.apiKey,
          model: settings.llm.model,
        }),
      });

      const data = await res.json();
      setTestResult(data);
    } catch (error: any) {
      setTestResult({ success: false, message: error.message });
    } finally {
      setTesting(false);
    }
  };

  const updateLLM = (updates: Partial<LLMSettings>) => {
    if (!settings) return;
    setSettings({
      ...settings,
      llm: { ...settings.llm, ...updates },
    });
  };

  const updateTTS = (updates: Partial<TTSSettings>) => {
    if (!settings) return;
    setSettings({
      ...settings,
      tts: { ...settings.tts, ...updates },
    });
  };

  const updateASR = (updates: Partial<ASRSettings>) => {
    if (!settings) return;
    setSettings({
      ...settings,
      asr: { ...settings.asr, ...updates },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-liquid rounded-macos-2xl w-[560px] max-w-[90vw] max-h-[85vh] flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-secondary" />
            <h2 className="text-[15px] font-semibold">设置</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center">
            <X className="w-4 h-4 text-secondary" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-black/5 dark:border-white/5 px-4">
          {[
            { id: 'llm', label: 'LLM 模型' },
            { id: 'tts', label: '语音合成' },
            { id: 'asr', label: '语音识别' },
            { id: 'token', label: 'TOKEN 套餐' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-tertiary hover:text-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-secondary" />
            </div>
          ) : settings ? (
            <>
              {/* LLM 设置 */}
              {activeTab === 'llm' && (
                <div className="space-y-4">
                  {/* 提供商选择 */}
                  <div>
                    <label className="text-xs font-medium text-secondary mb-2 block">提供商</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PROVIDERS.map(provider => (
                        <button
                          key={provider.value}
                          onClick={() => updateLLM({ provider: provider.value as any })}
                          className={`p-3 rounded-macos border text-left transition-all ${
                            settings.llm.provider === provider.value
                              ? 'border-primary bg-primary/5'
                              : 'border-black/5 dark:border-white/5 hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <provider.icon className="w-4 h-4 text-secondary" />
                            <span className="text-xs font-medium">{provider.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* API 地址 */}
                  {settings.llm.provider !== 'token' && (
                    <div>
                      <label className="text-xs font-medium text-secondary mb-2 block">API 地址</label>
                      <input
                        type="text"
                        value={settings.llm.baseUrl}
                        onChange={e => updateLLM({ baseUrl: e.target.value })}
                        placeholder="https://api.openai.com/v1"
                        className="w-full input-glass rounded-macos px-3 py-2 text-[13px]"
                      />
                    </div>
                  )}

                  {/* API Key */}
                  {settings.llm.provider !== 'token' && (
                    <div>
                      <label className="text-xs font-medium text-secondary mb-2 block">API Key</label>
                      <div className="relative">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={settings.llm.apiKey}
                          onChange={e => updateLLM({ apiKey: e.target.value })}
                          placeholder="sk-..."
                          className="w-full input-glass rounded-macos px-3 py-2 pr-10 text-[13px]"
                        />
                        <button
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-tertiary hover:text-secondary"
                        >
                          {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 模型选择 */}
                  <div>
                    <label className="text-xs font-medium text-secondary mb-2 block">模型</label>
                    <select
                      value={settings.llm.model}
                      onChange={e => updateLLM({ model: e.target.value })}
                      className="w-full input-glass rounded-macos px-3 py-2 text-[13px] appearance-none"
                    >
                      {(MODELS[settings.llm.provider] || MODELS.custom).map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>

                  {/* 高级设置 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-secondary mb-2 block">
                        最大 Tokens: {settings.llm.maxTokens}
                      </label>
                      <input
                        type="range"
                        min="100"
                        max="4000"
                        step="100"
                        value={settings.llm.maxTokens}
                        onChange={e => updateLLM({ maxTokens: parseInt(e.target.value) })}
                        className="w-full accent-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-secondary mb-2 block">
                        温度: {settings.llm.temperature}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={settings.llm.temperature}
                        onChange={e => updateLLM({ temperature: parseFloat(e.target.value) })}
                        className="w-full accent-primary"
                      />
                    </div>
                  </div>

                  {/* 测试连接 */}
                  {settings.llm.provider !== 'token' && (
                    <div>
                      <button
                        onClick={handleTestLLM}
                        disabled={testing}
                        className="btn-ghost px-4 py-2 rounded-macos text-xs font-medium flex items-center gap-2"
                      >
                        {testing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Zap className="w-3.5 h-3.5" />
                        )}
                        {testing ? '测试中...' : '测试连接'}
                      </button>
                      {testResult && (
                        <div className={`mt-2 p-2.5 rounded-macos text-xs ${
                          testResult.success
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                        }`}>
                          <div className="flex items-center gap-1.5">
                            {testResult.success ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                            {testResult.message}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TTS 设置 */}
              {activeTab === 'tts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-secondary">启用语音合成</label>
                    <button
                      onClick={() => updateTTS({ enabled: !settings.tts.enabled })}
                      className={`w-10 h-6 rounded-full transition-colors ${
                        settings.tts.enabled ? 'bg-primary' : 'bg-black/10 dark:bg-white/10'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                        settings.tts.enabled ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {settings.tts.enabled && (
                    <>
                      <div>
                        <label className="text-xs font-medium text-secondary mb-2 block">API 地址</label>
                        <input
                          type="text"
                          value={settings.tts.url}
                          onChange={e => updateTTS({ url: e.target.value })}
                          className="w-full input-glass rounded-macos px-3 py-2 text-[13px]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-secondary mb-2 block">API Key</label>
                        <input
                          type="password"
                          value={settings.tts.apiKey}
                          onChange={e => updateTTS({ apiKey: e.target.value })}
                          className="w-full input-glass rounded-macos px-3 py-2 text-[13px]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-secondary mb-2 block">模型</label>
                        <input
                          type="text"
                          value={settings.tts.model}
                          onChange={e => updateTTS({ model: e.target.value })}
                          className="w-full input-glass rounded-macos px-3 py-2 text-[13px]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-secondary mb-2 block">
                          语速: {settings.tts.speed}x
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={settings.tts.speed}
                          onChange={e => updateTTS({ speed: parseFloat(e.target.value) })}
                          className="w-full accent-primary"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ASR 设置 */}
              {activeTab === 'asr' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-secondary">启用语音识别</label>
                    <button
                      onClick={() => updateASR({ enabled: !settings.asr.enabled })}
                      className={`w-10 h-6 rounded-full transition-colors ${
                        settings.asr.enabled ? 'bg-primary' : 'bg-black/10 dark:bg-white/10'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                        settings.asr.enabled ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {settings.asr.enabled && (
                    <>
                      <div>
                        <label className="text-xs font-medium text-secondary mb-2 block">API 地址</label>
                        <input
                          type="text"
                          value={settings.asr.url}
                          onChange={e => updateASR({ url: e.target.value })}
                          className="w-full input-glass rounded-macos px-3 py-2 text-[13px]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-secondary mb-2 block">API Key</label>
                        <input
                          type="password"
                          value={settings.asr.apiKey}
                          onChange={e => updateASR({ apiKey: e.target.value })}
                          className="w-full input-glass rounded-macos px-3 py-2 text-[13px]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-secondary mb-2 block">模型</label>
                        <input
                          type="text"
                          value={settings.asr.model}
                          onChange={e => updateASR({ model: e.target.value })}
                          className="w-full input-glass rounded-macos px-3 py-2 text-[13px]"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TOKEN 套餐 */}
              {activeTab === 'token' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-macos-lg bg-gradient-to-br from-primary/10 to-accent-purple/10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-macos bg-primary/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-[15px] font-semibold">TOKEN 余额</div>
                        <div className="text-xs text-tertiary">当前可用额度</div>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-primary">
                      {settings.tokenBalance?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-tertiary mt-1">TOKENS</div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-medium text-secondary">购买套餐</h3>
                    {[
                      { tokens: 10000, price: 9.9, label: '体验版' },
                      { tokens: 100000, price: 79.9, label: '标准版', popular: true },
                      { tokens: 500000, price: 299.9, label: '专业版' },
                    ].map(pkg => (
                      <div
                        key={pkg.tokens}
                        className={`p-3 rounded-macos border transition-all cursor-pointer hover:border-primary/30 ${
                          pkg.popular ? 'border-primary/20 bg-primary/5' : 'border-black/5 dark:border-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-medium">{pkg.label}</span>
                              {pkg.popular && (
                                <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                  推荐
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-tertiary mt-0.5">
                              {pkg.tokens.toLocaleString()} TOKENS
                            </div>
                          </div>
                          <div className="text-[15px] font-semibold">
                            ¥{pkg.price}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-macos bg-black/3 dark:bg-white/3">
                    <div className="text-xs text-tertiary">
                      <p className="mb-1">💡 使用说明：</p>
                      <ul className="space-y-0.5 list-disc list-inside">
                        <li>1 个 TOKEN ≈ 1 个英文字符</li>
                        <li>中文约消耗 2-3 个 TOKENS</li>
                        <li>一次对话约消耗 500-2000 TOKENS</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-black/5 dark:border-white/5">
          <button onClick={onClose} className="btn-ghost px-4 py-1.5 rounded-macos text-[13px] font-medium">
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-5 py-1.5 rounded-macos text-[13px] font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
