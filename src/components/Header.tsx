import React from 'react';
import { Bot, FileDown, BookOpen, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenAIDialog: () => void;
  activeModule: number;
  onSelectModule: (m: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAIDialog,
  activeModule,
  onSelectModule,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div
          onClick={() => onSelectModule(1)}
          className="text-base font-bold tracking-tight text-slate-900 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center font-mono text-xs font-bold">
            R
          </span>
          <span>DataFrame 实验室 (R 语言版)</span>
        </div>

        {/* Zone 2: Clean 4–5 single-line navigation text links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
          <button
            onClick={() => onSelectModule(1)}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeModule === 1 ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            结构建模
          </button>
          <button
            onClick={() => onSelectModule(2)}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeModule === 2 ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            索引切片
          </button>
          <button
            onClick={() => onSelectModule(3)}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeModule === 3 ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            分组聚合
          </button>
          <button
            onClick={() => onSelectModule(5)}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeModule === 5 ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            实战案例
          </button>
          <button
            onClick={() => onSelectModule(10)}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 ${
              activeModule === 10 ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>知识导引</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenAIDialog}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>AI 随诊专家</span>
          </button>
        </div>
      </div>
    </header>
  );
};
