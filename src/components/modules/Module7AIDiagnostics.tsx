import React, { useState, useMemo, useEffect } from 'react';
import { allDatasets, dirtyDataset } from '../../data/datasets';
import { runComprehensiveDiagnostics } from '../../utils/diagnostics';
import { TableViewer } from '../TableViewer';
import { LLMSettingsModal } from '../LLMSettingsModal';
import {
  getLLMConfig,
  hasValidApiKey,
  diagnosePipelineWithClientLLM,
  chatWithClientLLM,
} from '../../services/llmClient';
import { LLMConfig } from '../../types/llm';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Code2,
  Send,
  Bot,
  RefreshCw,
  Lightbulb,
  Settings,
  Key,
  Cpu,
  ShieldCheck,
} from 'lucide-react';

export const Module7AIDiagnostics: React.FC = () => {
  const [activeDatasetId, setActiveDatasetId] = useState<string>('df_dirty_sample');
  const [activePipelineCode, setActivePipelineCode] = useState<string>(
    `# 当前执行的危险 R 代码（包含未解组与未过滤离群点）
dirty_result <- df_dirty %>%
  group_by(dept) %>%
  summarise(
    avg_score = mean(raw_score), # ⚠️ 缺失 na.rm = TRUE
    count = n()
  ) %>%
  mutate(dept_share = count / sum(count)) # ⚠️ 缺失 ungroup()，sum(count) 作用域受限！`
  );

  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [aiAnalysisMarkdown, setAiAnalysisMarkdown] = useState<string | null>(null);
  const [diagnosticSource, setDiagnosticSource] = useState<string>('');

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [llmConfig, setLlmConfig] = useState<LLMConfig>(getLLMConfig());
  const [hasKey, setHasKey] = useState<boolean>(hasValidApiKey());

  // Q&A State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; model?: string }>>([
    {
      sender: 'ai',
      text: '您好！我是您的现代 R 语言 tidyverse 随诊专家。无论您遇到 ungroup() 陷阱、因子水平断裂、NA 传染机制或数据管道调优，都可以随时向我咨询！',
    },
  ]);
  const [userQuery, setUserQuery] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);

  // Sync LLM config changes across components
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

  const currentDataset = useMemo(() => {
    return allDatasets.find((d) => d.id === activeDatasetId) || dirtyDataset;
  }, [activeDatasetId]);

  // Client-side rule audit
  const ruleIssues = useMemo(() => {
    return runComprehensiveDiagnostics(currentDataset, activePipelineCode, true);
  }, [currentDataset, activePipelineCode]);

  // Run Real AI Diagnosis
  const handleTriggerAIDiagnosis = async () => {
    // Check if API key is provided
    if (!hasValidApiKey()) {
      setIsSettingsOpen(true);
      return;
    }

    setIsDiagnosing(true);
    try {
      const summary = {
        name: currentDataset.name,
        rowCount: currentDataset.data.length,
        colCount: currentDataset.columns.length,
        hasRowNames: currentDataset.hasRowNames,
        columns: currentDataset.columns.map((c) => ({ name: c.name, type: c.type })),
      };

      const result = await diagnosePipelineWithClientLLM({
        datasetSummary: summary,
        pipelineCode: activePipelineCode,
        issuesDetected: ruleIssues,
        userContext: '请依据现代 tidyverse 标准全面诊断潜在的代数失真与代码健壮性漏洞',
      });

      setAiAnalysisMarkdown(result.text);
      setDiagnosticSource(`${result.model} (${result.durationMs}ms 浏览器直连)`);
    } catch (err: any) {
      console.error('Diagnosis failed:', err);
      setAiAnalysisMarkdown(
        `❌ 大模型诊断失败：${err.message || '网络请求异常'}。\n\n💡 请点击标题右侧的小齿轮 ⚙️ 检查您的 API-Key 或切换大模型（gemini 3 flash / deepseek-v4-pro）。`
      );
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleSendMessage = async (msgToSend?: string) => {
    const text = msgToSend || userQuery;
    if (!text.trim()) return;

    if (!hasValidApiKey()) {
      setIsSettingsOpen(true);
      return;
    }

    const newMessages = [...chatMessages, { sender: 'user' as const, text }];
    setChatMessages(newMessages);
    setUserQuery('');
    setIsChatSending(true);

    try {
      const result = await chatWithClientLLM({
        message: text,
        currentDataset: {
          name: currentDataset.name,
          rows: currentDataset.data.length,
          cols: currentDataset.columns.map((c) => c.name),
        },
        currentPipeline: activePipelineCode,
      });

      setChatMessages([
        ...newMessages,
        {
          sender: 'ai',
          text: result.text,
          model: result.model,
        },
      ]);
    } catch (err: any) {
      setChatMessages([
        ...newMessages,
        {
          sender: 'ai',
          text: `❌ 大模型调用出错：${err.message || '请求失败'}。\n\n请点击标题右侧的小齿轮 ⚙️ 确认您的 API-Key 是否正确无误。`,
        },
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  const QUICK_QUESTIONS = [
    '为什么忘记 ungroup() 会导致全局占比计算严重失真？',
    'R 语言中 na.rm = TRUE 为什么是聚合统计的强制规范？',
    '如何使用 tibble::rownames_to_column 消除行名索引陷阱？',
    '如何使用 across() 同时对所有数值列进行清洗和均值计算？',
  ];

  return (
    <div className="space-y-6">
      {/* Module Banner with Gear Icon on Title Right */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>模块 07</span>
              <span aria-hidden="true">·</span>
              <span>智能诊断随诊引擎</span>
              <span aria-hidden="true">·</span>
              <span>纯前端浏览器直连 · GitHub 部署就绪</span>
            </div>

            {/* Title with Gear Icon on the Far Right */}
            <div className="flex items-center flex-wrap gap-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                AI 诊断与大模型 Q&A 随诊
              </h1>

              {/* 小齿轮设置大模型图标 */}
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-all group shadow-2xs hover:border-slate-400"
                title="点击设置大模型与 API-Key"
              >
                <Settings className="w-3.5 h-3.5 text-slate-600 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-mono text-[11px] text-slate-900 font-semibold">
                  {llmConfig.model}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    hasKey
                      ? 'bg-emerald-500 ring-2 ring-emerald-200'
                      : 'bg-amber-500 ring-2 ring-amber-200 animate-pulse'
                  }`}
                  title={hasKey ? 'API-Key 已生效' : '未输入 API-Key，点击配置'}
                />
                <span className="text-[10px] text-slate-400 font-sans ml-0.5">
                  {hasKey ? '已就绪' : '未设置Key'}
                </span>
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              动态诊断分组后未解组导致的数据失真、因子类型 (Factor) 匹配错误、隐性缺失值 (NA) 污染算子及行名陷阱。支持在浏览器端直连
              <span className="font-mono font-medium text-slate-800 mx-1">gemini 3 flash</span>
              或
              <span className="font-mono font-medium text-slate-800 mx-1">deepseek-v4-pro</span>
              大模型。
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={activeDatasetId}
              onChange={(e) => setActiveDatasetId(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono text-slate-800"
            >
              {allDatasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name.split(' ')[0]} ({d.data.length}行)
                </option>
              ))}
            </select>

            <button
              onClick={handleTriggerAIDiagnosis}
              disabled={isDiagnosing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>{isDiagnosing ? '大模型诊断中...' : '启动 AI 深度诊断'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Code under diagnosis & Rule Audit */}
        <div className="lg:col-span-6 space-y-4">
          {/* Active Pipeline Code Editor */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-slate-600" />
                <span>待诊断的 R 语言数据处理管道：</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">实时双向监测</span>
            </div>
            <textarea
              value={activePipelineCode}
              onChange={(e) => setActivePipelineCode(e.target.value)}
              rows={6}
              className="w-full p-2.5 bg-slate-900 text-slate-100 font-mono text-xs rounded border border-slate-800 focus:outline-none"
            />
          </div>

          {/* Rule Engine Audit Alert Cards */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>实时规则引擎风险排查清单 ({ruleIssues.length} 项)</span>
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">毫秒级静态分析</span>
            </div>

            <div className="space-y-2.5">
              {ruleIssues.map((issue) => (
                <div
                  key={issue.id}
                  className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                    issue.level === 'critical'
                      ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                      : issue.level === 'warning'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                      : 'bg-teal-50/70 border-teal-200 text-teal-950'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      {issue.level === 'critical' ? (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      ) : issue.level === 'warning' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      )}
                      <span>{issue.title}</span>
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider opacity-70">
                      [{issue.level}]
                    </span>
                  </div>

                  <p className="text-[11px] opacity-90 leading-relaxed">{issue.description}</p>

                  {issue.codeSuggestion && (
                    <div className="mt-1 p-2 bg-white/80 rounded font-mono text-[11px] border border-slate-200/60 overflow-x-auto text-slate-800">
                      <div className="text-[10px] text-slate-400 font-sans font-semibold">推荐修复代码：</div>
                      <code>{issue.codeSuggestion}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Under audit dataset viewer */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-4">
            <div className="text-xs font-bold text-slate-900 mb-2">
              当前受检数据集：{currentDataset.name}
            </div>
            <TableViewer df={currentDataset} maxRows={6} />
          </div>
        </div>

        {/* Right: AI Diagnosis Report & Interactive Q&A */}
        <div className="lg:col-span-6 space-y-4">
          {/* AI Comprehensive Analysis Card */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>AI 深度随诊意见书</span>
              </span>
              {diagnosticSource && (
                <span className="text-[11px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                  {diagnosticSource}
                </span>
              )}
            </div>

            {aiAnalysisMarkdown ? (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-800 space-y-3 leading-relaxed whitespace-pre-wrap font-sans">
                {aiAnalysisMarkdown}
              </div>
            ) : (
              <div className="py-8 text-center border border-dashed border-slate-200 rounded-lg text-xs text-slate-400 space-y-2">
                <Sparkles className="w-6 h-6 text-slate-300 mx-auto" />
                <div>点击上方 “启动 AI 深度诊断” 按钮</div>
                <div className="text-[11px] text-slate-400">
                  当前设定模型：<strong className="text-slate-600 font-mono">{llmConfig.model}</strong>
                  {hasKey ? '（已配置 API-Key）' : '（需先点击齿轮输入 API-Key）'}
                </div>
              </div>
            )}
          </div>

          {/* Live R Q&A Chat Box */}
          <div className="bg-white border border-slate-200/90 rounded-lg overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-teal-300" />
                <span>R 语言数据科学家即时问答随诊</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-slate-800 text-teal-300 px-2 py-0.5 rounded border border-slate-700">
                  {llmConfig.model}
                </span>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-slate-400 hover:text-white transition-colors"
                  title="设置大模型"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="p-4 h-64 overflow-y-auto space-y-3 bg-slate-50/50">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 text-xs ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-teal-300" />
                    </div>
                  )}
                  <div className="max-w-[85%] space-y-1">
                    <div
                      className={`p-3 rounded-lg leading-relaxed whitespace-pre-wrap ${
                        msg.sender === 'user'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.model && (
                      <div className="text-[10px] font-mono text-slate-400 px-1">
                        由 {msg.model} 生成
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isChatSending && (
                <div className="flex gap-2 text-xs text-slate-400 items-center">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0 animate-pulse">
                    <Bot className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <span className="italic">
                    正在调用 {llmConfig.model} 思考现代 R 语言解答...
                  </span>
                </div>
              )}
            </div>

            {/* Quick Pills */}
            <div className="px-4 py-2 border-t border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-slate-400 shrink-0 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-500" />
                <span>快速提问：</span>
              </span>
              {QUICK_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors whitespace-nowrap shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
              <input
                type="text"
                placeholder={
                  hasKey
                    ? `向 ${llmConfig.model} 提问关于切片、聚合与管道代码...`
                    : '请先点击齿轮输入 API-Key 后方可提问...'
                }
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-500 text-slate-800"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isChatSending || !userQuery.trim()}
                className="px-3.5 py-2 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors disabled:opacity-50 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LLM Settings Modal */}
      <LLMSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={(newCfg) => {
          setLlmConfig(newCfg);
          setHasKey(Boolean(newCfg.apiKey && newCfg.apiKey.trim().length > 3));
        }}
      />
    </div>
  );
};
