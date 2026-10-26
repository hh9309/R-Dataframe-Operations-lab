import React, { useState, useMemo } from 'react';
import { allDatasets, ecommerceDataset } from '../../data/datasets';
import { DataFrame, FilterCondition } from '../../types/dataframe';
import { executeFilter, executeGroupBySummarise } from '../../utils/rEngine';
import { runComprehensiveDiagnostics } from '../../utils/diagnostics';
import { TableViewer } from '../TableViewer';
import {
  Workflow,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Database,
  Scissors,
  Layers,
  Sparkles,
  Download,
  AlertTriangle,
  Code2,
} from 'lucide-react';

export const Module8Workflow: React.FC<{ onNavigateToExport: () => void }> = ({
  onNavigateToExport,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('df_ecommerce');

  // Step 2 filter state
  const [filterThreshold, setFilterThreshold] = useState<number>(2000);

  // Step 3 group by state
  const [groupCol, setGroupCol] = useState<string>('membership_tier');
  const [safeUngroup, setSafeUngroup] = useState<boolean>(true);

  const baseDataset = useMemo(() => {
    return allDatasets.find((d) => d.id === selectedDatasetId) || ecommerceDataset;
  }, [selectedDatasetId]);

  // Step 2: Sliced data
  const slicedData = useMemo(() => {
    const numCol = baseDataset.columns.find((c) => c.type === 'numeric')?.name || baseDataset.columns[1].name;
    const cond: FilterCondition[] = [
      {
        id: 'w1',
        column: numCol,
        operator: '>=',
        value: filterThreshold,
        logic: '&',
      },
    ];
    return executeFilter(baseDataset, cond);
  }, [baseDataset, filterThreshold]);

  // Step 3: Aggregated data
  const aggregatedData = useMemo(() => {
    const numericCol = baseDataset.columns.find((c) => c.type === 'numeric')?.name || baseDataset.columns[1].name;
    return executeGroupBySummarise(
      slicedData,
      [groupCol],
      [
        { column: numericCol, fn: 'mean', alias: `mean_${numericCol}`, naRm: true },
        { column: numericCol, fn: 'sum', alias: `sum_${numericCol}`, naRm: true },
        { column: baseDataset.columns[0].name, fn: 'count', alias: 'sample_count', naRm: true },
      ],
      safeUngroup
    );
  }, [slicedData, groupCol, safeUngroup, baseDataset]);

  // Step 4: Diagnostics
  const workflowDiagnostics = useMemo(() => {
    const code = `# Pipeline
df %>% filter() %>% group_by(${groupCol}) %>% summarise() ${safeUngroup ? '%>% ungroup()' : ''}`;
    return runComprehensiveDiagnostics(aggregatedData.resultDf, code, !safeUngroup);
  }, [aggregatedData, groupCol, safeUngroup]);

  const STEPS = [
    { num: 1, title: '数据加载', desc: '源数据导入与类型校验', icon: Database },
    { num: 2, title: '索引切片', desc: '行过滤与异常剔除', icon: Scissors },
    { num: 3, title: '分组聚合', desc: 'group_by 拆分汇总', icon: Layers },
    { num: 4, title: '智能诊断', desc: '代数与整洁度核验', icon: Sparkles },
    { num: 5, title: '报告导出', desc: '生成一键式 R 分析报告', icon: Download },
  ];

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>模块 08</span>
            <span aria-hidden="true">·</span>
            <span>端到端向导流水线</span>
            <span aria-hidden="true">·</span>
            <span>数据处理生命周期</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            导入 → 切片 → 聚合 → 智能诊断全流程
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            CSV/Excel 数据加载 $\rightarrow$ 索引过滤与切片 $\rightarrow$ 分组管道聚合 $\rightarrow$ 导出一键式 R 语言分析报告。
          </p>
        </div>
      </div>

      {/* 5-Step Process Bar */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-4">
        <div className="grid grid-cols-5 gap-2">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isCurrent = currentStep === s.num;
            const isCompleted = currentStep > s.num;
            return (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`p-3 rounded-lg border text-left transition-colors flex flex-col justify-between ${
                  isCurrent
                    ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                    : isCompleted
                    ? 'border-teal-200 bg-teal-50/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                      isCurrent
                        ? 'bg-indigo-600 text-white'
                        : isCompleted
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
                  </span>
                  <Icon
                    className={`w-4 h-4 ${
                      isCurrent ? 'text-indigo-600' : isCompleted ? 'text-teal-600' : 'text-slate-400'
                    }`}
                  />
                </div>
                <div className="mt-2">
                  <div
                    className={`text-xs font-bold ${
                      isCurrent ? 'text-indigo-950' : 'text-slate-800'
                    }`}
                  >
                    {s.title}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">{s.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Workspace Content */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-6 space-y-6">
        {/* Step 1: Data Loading */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">第 1 步：选择数据源与模式校验 (read_csv)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                选择内置的典型工业级数据集，或者直接载入带有常见脏数据陷阱的测试表。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {allDatasets.map((ds) => (
                <div
                  key={ds.id}
                  onClick={() => setSelectedDatasetId(ds.id)}
                  className={`p-3.5 border rounded-lg cursor-pointer transition-colors ${
                    selectedDatasetId === ds.id
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-mono text-xs font-bold">{ds.name.split(' ')[0]}</div>
                  <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {ds.description}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2 font-mono">
                    {ds.data.length} 行 × {ds.columns.length} 列
                  </div>
                </div>
              ))}
            </div>

            <TableViewer df={baseDataset} maxRows={6} title="当前源数据预览" />
          </div>
        )}

        {/* Step 2: Slicing */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">第 2 步：条件过滤与索引切片 (dplyr::filter)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                设定数值过滤门限，剔除未达标样本或前向切片。
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                <span>过滤门限 (filter): {baseDataset.columns.find((c) => c.type === 'numeric')?.name || 'value'} &gt;=</span>
                <span className="font-mono text-indigo-600 font-bold">{filterThreshold}</span>
              </label>
              <input
                type="range"
                min="0"
                max="10000"
                step="500"
                value={filterThreshold}
                onChange={(e) => setFilterThreshold(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0</span>
                <span>5,000</span>
                <span>10,000</span>
              </div>
            </div>

            <TableViewer df={slicedData} maxRows={6} title="切片后留存观测" />
          </div>
        )}

        {/* Step 3: Group by & Summarise */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">第 3 步：分组管道聚合 (group_by %&gt;% summarise)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                按分类特征构建聚合统计表，并配置是否显式解组。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <label className="text-xs font-semibold text-slate-800 block">
                  选择分组变量 (group_by)：
                </label>
                <select
                  value={groupCol}
                  onChange={(e) => setGroupCol(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono"
                >
                  {baseDataset.columns.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">显式调用 ungroup()</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {safeUngroup ? '已启用：解除分组锁定' : '已关闭：保留分组属性 (可能污染下步统计)'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={safeUngroup}
                  onChange={(e) => setSafeUngroup(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600"
                />
              </div>
            </div>

            <TableViewer df={aggregatedData.resultDf} maxRows={8} title="分组汇总生成表" />
          </div>
        )}

        {/* Step 4: AI & Rule Diagnostics */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">第 4 步：全流程智能诊断与鲁棒性核验</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                审查该流水线是否存在未解组、隐性 NA 传染、行名混乱等致命数据隐患。
              </p>
            </div>

            <div className="space-y-2">
              {workflowDiagnostics.map((iss) => (
                <div
                  key={iss.id}
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                    iss.level === 'critical'
                      ? 'bg-rose-50 border-rose-200 text-rose-950'
                      : iss.level === 'warning'
                      ? 'bg-amber-50 border-amber-200 text-amber-950'
                      : 'bg-teal-50 border-teal-200 text-teal-950'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="block">{iss.title}</strong>
                    <p className="text-[11px] opacity-90">{iss.description}</p>
                    {iss.codeSuggestion && (
                      <code className="block mt-1 p-1 bg-white/70 rounded font-mono text-[10px]">
                        {iss.codeSuggestion}
                      </code>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs">
              <div className="text-teal-400"># 验证通过的完整 pipeline 脚本：</div>
              <div className="mt-1">
                clean_report &lt;- {selectedDatasetId} %&gt;% filter(monetary_rmb &gt;= {filterThreshold}) %&gt;%
                group_by({groupCol}) %&gt;% summarise(across(where(is.numeric), ~mean(.x, na.rm = TRUE))) {safeUngroup ? '%>% ungroup()' : ''}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Export Ready */}
        {currentStep === 5 && (
          <div className="space-y-4 text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
            <h2 className="text-base font-bold text-slate-900">
              全流程流水线已成功执行并通过质量质检！
            </h2>
            <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
              您的数据集已完成“导入 $\to$ 过滤切片 $\to$ 管道聚合 $\to$ 智能诊断”的全流程闭环。现在可一键前往“模块 09”导出 Clean Dataset、ggplot2 图表与 R Markdown 报告。
            </p>
            <div className="pt-2">
              <button
                onClick={onNavigateToExport}
                className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 text-xs font-semibold inline-flex items-center gap-2 shadow-xs"
              >
                <Download className="w-4 h-4 text-teal-300" />
                <span>立即进入导出引擎 (模块 09)</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Step Buttons */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            disabled={currentStep === 1}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>上一步</span>
          </button>

          <span className="text-xs font-mono text-slate-400">
            步骤 {currentStep} / {STEPS.length}
          </span>

          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep((s) => Math.min(5, s + 1))}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800"
            >
              <span>下一步</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onNavigateToExport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-700 text-white rounded text-xs font-medium hover:bg-teal-800"
            >
              <span>前往报告导出</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
