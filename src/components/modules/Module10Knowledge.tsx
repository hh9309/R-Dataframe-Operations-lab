import React, { useState } from 'react';
import { knowledgeSlices, KnowledgeSlice } from '../../data/knowledge';
import {
  Compass,
  BookOpen,
  ArrowRight,
  Code2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  FileText,
} from 'lucide-react';

export const Module10Knowledge: React.FC = () => {
  const [activeSliceId, setActiveSliceId] = useState<string>('slice_1_tidy_data');
  const [copiedCode, setCopiedCode] = useState(false);

  const currentSlice = knowledgeSlices.find((s) => s.id === activeSliceId) || knowledgeSlices[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSlice.codeExample);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>模块 10</span>
            <span aria-hidden="true">·</span>
            <span>理论知识多维切片导引</span>
            <span aria-hidden="true">·</span>
            <span>Hadley Wickham 现代统计计算专论</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            DataFrame 数据要素与多维切片知识导引
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            深入解析整洁数据三大解构、R 语言管道符函数式思维、三大致命陷阱以及盲目求均值等误区警示。
          </p>
        </div>
      </div>

      {/* 4 Knowledge Slice Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {knowledgeSlices.map((slice) => {
          const isSelected = activeSliceId === slice.id;
          return (
            <button
              key={slice.id}
              onClick={() => setActiveSliceId(slice.id)}
              className={`p-4 rounded-lg border text-left transition-colors flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
              }`}
            >
              <div>
                <span
                  className={`text-[11px] font-mono font-bold tracking-wider uppercase ${
                    isSelected ? 'text-teal-300' : 'text-indigo-600'
                  }`}
                >
                  【{slice.sliceNumber}】
                </span>
                <h3 className="text-xs font-bold mt-1 leading-snug line-clamp-2">
                  {slice.title}
                </h3>
              </div>
              <div
                className={`text-[11px] mt-2 line-clamp-2 ${
                  isSelected ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {slice.subtitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Slice Deep Dive Workbench */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-6 space-y-6">
        {/* Header zone */}
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 font-semibold mb-1">
            <span>{currentSlice.sliceNumber} 深度专论</span>
            <span aria-hidden="true">·</span>
            <span>Hadley Wickham Tidy Standard</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">{currentSlice.title}</h2>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{currentSlice.summary}</p>
        </div>

        {/* Core Concepts Taxonomy Grid */}
        <div>
          <div className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-slate-700" />
            <span>核心概念形式化解构 (Core Concepts Taxonomy)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {currentSlice.coreConcepts.map((cc, i) => (
              <div key={i} className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs space-y-1.5">
                <div className="font-semibold text-slate-900 font-mono text-[11px]">{cc.term}</div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{cc.definition}</p>
                <div className="pt-1 font-mono text-[10px] text-indigo-700">
                  R 对应: <code>{cc.rAnalogy}</code>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deep Dive Theory Text */}
        <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-lg text-xs text-slate-800 leading-relaxed space-y-3 font-sans">
          <div className="text-xs font-bold text-slate-900">学术原理与工程剖析：</div>
          <div className="whitespace-pre-wrap">{currentSlice.deepDiveMarkdown}</div>
        </div>

        {/* Code Example & Safe Practice */}
        <div className="bg-slate-900 rounded-lg p-4 text-slate-100 font-mono text-xs overflow-x-auto space-y-2">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-teal-400" />
              <span>标准防御性 R 脚本范式：</span>
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-100 transition-colors"
            >
              {copiedCode ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCode ? '已复制代码' : '复制代码'}</span>
            </button>
          </div>
          <pre className="leading-relaxed whitespace-pre-wrap">{currentSlice.codeExample}</pre>
        </div>

        {/* Right vs Wrong Comparison */}
        <div>
          <div className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>典型陷阱与防御性写法对照表 (Common Pitfalls & Fixes)</span>
          </div>
          <div className="space-y-3">
            {currentSlice.commonMistakes.map((m, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-700">
                    <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>致命陷阱写法：</span>
                  </div>
                  <p className="text-slate-700 pl-5 font-mono text-[11px]">{m.wrong}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-teal-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>工业级防御性方案：</span>
                  </div>
                  <p className="text-slate-700 pl-5 font-mono text-[11px]">{m.right}</p>
                  <p className="text-[11px] text-slate-500 pl-5 italic mt-1">{m.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
