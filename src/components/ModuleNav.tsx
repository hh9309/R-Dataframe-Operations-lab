import React from 'react';
import {
  Boxes,
  Scissors,
  Layers,
  GitMerge,
  FolderGit2,
  Terminal,
  Bot,
  Workflow,
  Download,
  Compass,
} from 'lucide-react';

interface ModuleNavProps {
  activeModule: number;
  onSelectModule: (m: number) => void;
}

export const MODULE_DEFINITIONS = [
  { id: 1, label: '结构代数', title: '表格数据代数与 DataFrame 结构建模', icon: Boxes },
  { id: 2, label: '索引切片', title: '交互式索引、切片与条件过滤', icon: Scissors },
  { id: 3, label: '分组聚合', title: '分组聚合 (Group-by & Summarise) 引擎', icon: Layers },
  { id: 4, label: '连接重塑', title: '多表连接 (Joins) 与长宽表转化', icon: GitMerge },
  { id: 5, label: '六大案例', title: '六大 DataFrame 数据分析实战案例库', icon: FolderGit2 },
  { id: 6, label: 'R代码引擎', title: 'R 语言 tidyverse 脚本代码引擎', icon: Terminal },
  { id: 7, label: 'AI诊断随诊', title: 'AI 诊断与大模型 Q&A 随诊', icon: Bot },
  { id: 8, label: '全流程导引', title: '导入→切片→聚合→智能诊断全流程', icon: Workflow },
  { id: 9, label: '报告导出', title: '数据集与分析报告导出引擎', icon: Download },
  { id: 10, label: '数据要素', title: 'DataFrame 数据要素与多维切片知识导引', icon: Compass },
];

export const ModuleNav: React.FC<ModuleNavProps> = ({ activeModule, onSelectModule }) => {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center overflow-x-auto py-2.5 gap-1.5 scrollbar-thin scrollbar-thumb-slate-200">
          {MODULE_DEFINITIONS.map((mod) => {
            const Icon = mod.icon;
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => onSelectModule(mod.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={mod.title}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-300' : 'text-slate-400'}`} />
                <span>{mod.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
