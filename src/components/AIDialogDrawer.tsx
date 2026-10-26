import React, { useState, useEffect } from 'react';
import { X, Bot, Send, Sparkles, Lightbulb, Settings, AlertTriangle } from 'lucide-react';
import { LLMSettingsModal } from './LLMSettingsModal';
import { getLLMConfig, hasValidApiKey, chatWithClientLLM } from '../services/llmClient';
import { LLMConfig } from '../types/llm';

interface AIDialogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIDialogDrawer: React.FC<AIDialogDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; model?: string }>>([
    {
      sender: 'ai',
      text: '您好！我是嵌入在实验室的 R 语言数据科学随诊导师。无论您在进行数据切片、分组聚合还是多表连接，遇到诸如未解组污染、隐性 NA 传染或因子水平失真，都可以随时向我咨询！',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [llmConfig, setLlmConfig] = useState<LLMConfig>(getLLMConfig());
  const [hasKey, setHasKey] = useState<boolean>(hasValidApiKey());

  useEffect(() => {
    const handleConfigChange = (e: any) => {
      if (e.detail) {
        setLlmConfig(e.detail);
        setHasKey(Boolean(e.detail.apiKey && e.detail.apiKey.trim().length > 3));
      } else {
        const cfg = getLLMConfig();
        setLlmConfig(cfg);
        setHasKey(hasValidApiKey());
      }
    };

    window.addEventListener('llm_config_changed', handleConfigChange);
    return () => {
      window.removeEventListener('llm_config_changed', handleConfigChange);
    };
  }, []);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputQuery;
    if (!text.trim()) return;

    if (!hasValidApiKey()) {
      setIsSettingsOpen(true);
      return;
    }

    const newMsgs = [...messages, { sender: 'user' as const, text }];
    setMessages(newMsgs);
    setInputQuery('');
    setLoading(true);

    try {
      const result = await chatWithClientLLM({ message: text });
      setMessages([
        ...newMsgs,
        {
          sender: 'ai',
          text: result.text,
          model: result.model,
        },
      ]);
    } catch (err: any) {
      setMessages([
        ...newMsgs,
        {
          sender: 'ai',
          text: `❌ 大模型调用出错：${err.message || '请求失败'}。\n\n请点击右上角齿轮 ⚙️ 检查您的 API-Key 或切换模型。`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const PROMPT_SUGGESTIONS = [
    '为什么忘记 ungroup() 会导致全局占比计算严重失真？',
    '如何使用 across() 同时对多个数值列做加权汇总？',
    '金融时间序列中缺失的周末数据如何优雅前向插补？',
    'left_join 时遇到多对多笛卡尔积爆炸如何防范？',
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-2xs transition-opacity"
          onClick={onClose}
        />

        {/* Slide-out Drawer */}
        <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200">
          {/* Drawer Header */}
          <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                <Bot className="w-4 h-4 text-teal-300" />
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-1.5">
                  <span>R 语言大模型 Q&A 随诊</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      hasKey ? 'bg-teal-400' : 'bg-amber-400 animate-pulse'
                    }`}
                  />
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {llmConfig.model} · 浏览器直连
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Gear Settings Button */}
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="设置大模型与 API-Key"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Message Scroll */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-teal-300" />
                  </div>
                )}
                <div className="max-w-[85%] space-y-1">
                  <div
                    className={`p-3 rounded-lg leading-relaxed whitespace-pre-wrap ${
                      m.sender === 'user'
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.model && (
                    <div className="text-[10px] font-mono text-slate-400 px-1">
                      由 {m.model} 生成
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 text-xs text-slate-400 items-center">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <span className="italic">正在由 {llmConfig.model} 生成回答...</span>
              </div>
            )}
          </div>

          {/* Prompt Suggestions */}
          <div className="p-3 border-t border-slate-200 bg-white space-y-1.5">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-500" />
              <span>随诊常见疑问建议：</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {PROMPT_SUGGESTIONS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] transition-colors text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Drawer Input */}
          <div className="p-4 border-t border-slate-200 bg-white flex items-center gap-2">
            <input
              type="text"
              placeholder={
                hasKey
                  ? `向 ${llmConfig.model} 提问...`
                  : '请先设置 API-Key 后方可提问...'
              }
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-500 text-slate-800"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !inputQuery.trim()}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <LLMSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={(cfg) => {
          setLlmConfig(cfg);
          setHasKey(Boolean(cfg.apiKey && cfg.apiKey.trim().length > 3));
        }}
      />
    </>
  );
};
