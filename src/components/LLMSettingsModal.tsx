import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Key,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { LLMConfig, LLMModelId } from '../types/llm';
import {
  getLLMConfig,
  saveLLMConfig,
  clearLLMConfig,
  DEFAULT_LLM_CONFIG,
} from '../services/llmClient';

interface LLMSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (config: LLMConfig) => void;
}

export const LLMSettingsModal: React.FC<LLMSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [selectedModel, setSelectedModel] = useState<LLMModelId>('gemini 3 flash');
  const [apiKey, setApiKey] = useState<string>('');
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      const current = getLLMConfig();
      setSelectedModel(current.model);
      setApiKey(current.apiKey);
      setBaseUrl(current.baseUrl || '');
      setErrorMessage(null);
      setSuccessToast(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      setErrorMessage('请输入 API-Key。本项目部署于前端浏览器环境，调用大模型必须输入有效的 API-Key。');
      return;
    }

    setErrorMessage(null);
    const newConfig: LLMConfig = {
      model: selectedModel,
      apiKey: trimmedKey,
      baseUrl: baseUrl.trim(),
      provider: selectedModel === 'deepseek-v4-pro' ? 'deepseek' : 'google',
    };

    saveLLMConfig(newConfig);
    setSuccessToast(`已确认并成功保存大模型配置：${selectedModel}`);
    if (onSaved) onSaved(newConfig);

    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleClear = () => {
    clearLLMConfig();
    setApiKey('');
    setBaseUrl('');
    setSuccessToast('已成功清除本地保存的 API-Key 与大模型配置');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-10 transition-all">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
              <Settings className="w-4 h-4 text-teal-300" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                <span>大模型参数配置与密钥管理</span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-1.5 py-0.5 rounded font-mono">
                  Client Direct
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                支持 GitHub 静态部署 · 浏览器端直接调用大模型
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[80vh] overflow-y-auto">
          {/* GitHub Deployment Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-[11px] text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-800">安全与纯前端架构保障：</span>
              <p>
                本项目支持直接部署至 GitHub Pages。您填写的 API-Key 仅保存在当前浏览器的 LocalStorage 中，发起请求时直接由浏览器调用大模型官方端点，绝不经过任何第三方服务器中转。
              </p>
            </div>
          </div>

          {/* Step 1: Select LLM Model */}
          <div className="space-y-2.5">
            <label className="font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-slate-700" />
                <span>选择大模型 (LLM Model)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">2 个支持模型</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: gemini 3 flash */}
              <button
                type="button"
                onClick={() => setSelectedModel('gemini 3 flash')}
                className={`text-left p-3.5 rounded-lg border transition-all relative ${
                  selectedModel === 'gemini 3 flash'
                    ? 'border-teal-600 bg-teal-50/40 ring-1 ring-teal-500/50'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 font-mono">gemini 3 flash</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-sky-100 text-sky-800">
                    Google
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  轻量极速架构，专精现代 tidyverse 语法推导、代数结构解析与 ggplot2 规范。
                </p>
                {selectedModel === 'gemini 3 flash' && (
                  <CheckCircle2 className="w-4 h-4 text-teal-600 absolute bottom-3 right-3" />
                )}
              </button>

              {/* Option 2: deepseek-v4-pro */}
              <button
                type="button"
                onClick={() => setSelectedModel('deepseek-v4-pro')}
                className={`text-left p-3.5 rounded-lg border transition-all relative ${
                  selectedModel === 'deepseek-v4-pro'
                    ? 'border-teal-600 bg-teal-50/40 ring-1 ring-teal-500/50'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 font-mono">deepseek-v4-pro</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-indigo-100 text-indigo-800">
                    DeepSeek
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  高阶深度逻辑推理模型，擅长复杂数据管道重构、假设检验与异常审计。
                </p>
                {selectedModel === 'deepseek-v4-pro' && (
                  <CheckCircle2 className="w-4 h-4 text-teal-600 absolute bottom-3 right-3" />
                )}
              </button>
            </div>
          </div>

          {/* Step 2: Manual Input of API-Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-slate-700" />
                <span>手工输入 API-Key</span>
                <span className="text-rose-500">*</span>
              </label>

              {selectedModel === 'gemini 3 flash' ? (
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-teal-700 hover:underline flex items-center gap-1"
                >
                  <span>获取 Gemini Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <a
                  href="https://platform.deepseek.com/api_keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-teal-700 hover:underline flex items-center gap-1"
                >
                  <span>获取 DeepSeek Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={
                  selectedModel === 'gemini 3 flash'
                    ? '例如: AIzaSy...'
                    : '例如: sk-...'
                }
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showKey ? '隐藏密钥' : '显示密钥'}
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              必须输入对应模型的 API-Key 方可进行智能诊断与 Q&A 随诊。
            </p>
          </div>

          {/* Optional: Advanced Custom Base URL (for proxies/reverse proxy) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] text-slate-500 hover:text-slate-800 underline decoration-dotted flex items-center gap-1"
            >
              <span>{showAdvanced ? '收起自定义端点配置' : '配置自定义 API 代理端点 (可选)'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <label className="text-[11px] font-medium text-slate-700">
                  自定义 API Base URL（留空则使用官方默认端点）：
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder={
                    selectedModel === 'gemini 3 flash'
                      ? 'https://generativelanguage.googleapis.com'
                      : 'https://api.deepseek.com'
                  }
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <span className="text-[10px] text-slate-400">
                  适合公司内部网关代理或海外 API 转发加速。
                </span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Toast */}
          {successToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successToast}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>清除配置</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-300" />
              <span>确认大模型</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
