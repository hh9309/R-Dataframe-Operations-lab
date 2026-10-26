import React, { useState, useMemo } from 'react';
import { TableViewer } from '../TableViewer';
import { allDatasets, ecommerceDataset } from '../../data/datasets';
import { AggregationTarget, AggregationFunction } from '../../types/dataframe';
import { executeGroupBySummarise } from '../../utils/rEngine';
import { Layers, Plus, Trash2, AlertTriangle, Code2, Copy, Check, ArrowRight, ShieldCheck } from 'lucide-react';

export const Module3Group: React.FC = () => {
  const [activeDatasetId, setActiveDatasetId] = useState<string>('df_ecommerce');
  const [groupByCols, setGroupByCols] = useState<string[]>(['membership_tier']);
  const [dropGroups, setDropGroups] = useState<boolean>(true); // ungroup() flag
  const [copiedCode, setCopiedCode] = useState(false);

  const [aggregations, setAggregations] = useState<AggregationTarget[]>([
    { column: 'recency_days', fn: 'mean', alias: 'avg_recency', naRm: true },
    { column: 'monetary_rmb', fn: 'mean', alias: 'avg_monetary', naRm: true },
    { column: 'monetary_rmb', fn: 'sum', alias: 'total_revenue', naRm: true },
    { column: 'customer_id', fn: 'count', alias: 'customer_count', naRm: true },
  ]);

  const currentDataset = useMemo(() => {
    return allDatasets.find((d) => d.id === activeDatasetId) || ecommerceDataset;
  }, [activeDatasetId]);

  // Execute Group By & Summarise
  const { resultDf, groupedBuckets } = useMemo(() => {
    return executeGroupBySummarise(currentDataset, groupByCols, aggregations, dropGroups);
  }, [currentDataset, groupByCols, aggregations, dropGroups]);

  // Generated R Code
  const generatedRCode = useMemo(() => {
    const groupColsStr = groupByCols.join(', ');
    const summariseLines = aggregations
      .map((agg) => {
        if (agg.fn === 'count') {
          return `${agg.alias} = n()`;
        }
        return `${agg.alias} = ${agg.fn}(${agg.column}${agg.naRm ? ', na.rm = TRUE' : ''})`;
      })
      .join(',\n    ');

    const groupDropArg = dropGroups ? ',\n    .groups = "drop"' : '';
    const ungroupLine = dropGroups ? '  # 自动解除分组上下文\n  ungroup() %>%\n' : '  # ⚠️ 警告：未调用 ungroup()，数据仍处于分组状态！\n';

    return `# ==============================================================================
# R tidyverse Group-by & Summarise Pipeline
# Ready to run directly in RStudio / R CLI without external dependencies
# ==============================================================================
library(dplyr)
library(tibble)

# 1. Sample Dataset (for standalone execution)
${activeDatasetId} <- tibble(
  membership_tier = factor(c("VIP", "Gold", "VIP", "Silver", "Standard", "VIP")),
  recency_days = c(4, 12, 8, 22, 85, 2),
  monetary_rmb = c(14200.5, 8650.0, 21800.0, 5400.0, 720.0, 45800.0),
  frequency = c(28, 19, 35, 12, 3, 51)
)

# 2. Main Grouped Aggregation Pipeline
grouped_summary <- ${activeDatasetId} %>%
  # Step 1: Split by factor column
  group_by(${groupColsStr || '/* Ungrouped */'}) %>%
  # Step 2 & 3: Apply & Combine
  summarise(
    ${summariseLines}${groupDropArg}
  )${dropGroups ? ' %>% \n  ungroup()' : ''}

print(grouped_summary)`;
  }, [activeDatasetId, groupByCols, aggregations, dropGroups]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedRCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const addAggregation = () => {
    const numericCols = currentDataset.columns.filter((c) => c.type === 'numeric' || c.type === 'integer');
    const targetCol = numericCols[0]?.name || currentDataset.columns[0].name;
    setAggregations([
      ...aggregations,
      {
        column: targetCol,
        fn: 'mean',
        alias: `mean_${targetCol}`,
        naRm: true,
      },
    ]);
  };

  const removeAggregation = (idx: number) => {
    if (aggregations.length > 1) {
      setAggregations(aggregations.filter((_, i) => i !== idx));
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>模块 03</span>
              <span aria-hidden="true">·</span>
              <span>拆分-应用-合并引擎</span>
              <span aria-hidden="true">·</span>
              <span>dplyr::group_by & summarise</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              分组聚合 (Group-by & Summarise) 引擎
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              集成 <code>group_by()</code> 与多变量聚合函数，高效执行分组计数、均值、标准差及自定义统计量计算，直观洞察未解组导致的代数失真风险。
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={activeDatasetId}
              onChange={(e) => {
                setActiveDatasetId(e.target.value);
                const ds = allDatasets.find((d) => d.id === e.target.value);
                const fctCol = ds?.columns.find((c) => c.type === 'factor')?.name;
                if (fctCol) setGroupByCols([fctCol]);
              }}
              className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono text-slate-800"
            >
              {allDatasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name.split(' ')[0]} ({d.data.length}行)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Split-Apply-Combine Visualizer Banner */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-4">
        <div className="text-xs font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-700" />
          <span>Split-Apply-Combine 三阶段数据流代数演播：</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stage 1: Split */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>1. 拆分 (Split)</span>
              <span className="font-mono text-[10px] text-slate-500">
                {Object.keys(groupedBuckets).length} 个组切片
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              依据 <code>group_by({groupByCols.join(', ')})</code> 将全表解构为独立的局部矩阵子块。
            </p>
          </div>

          {/* Stage 2: Apply */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>2. 应用 (Apply)</span>
              <span className="font-mono text-[10px] text-slate-500">
                {aggregations.length} 个聚合算子
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              对各子块并行执行向量聚合统计量（<code>mean</code>, <code>sd</code>, <code>n()</code> 等）。
            </p>
          </div>

          {/* Stage 3: Combine */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>3. 合并 (Combine)</span>
              <span className="font-mono text-[10px] text-teal-700 font-bold">
                {resultDf.data.length} 行汇总表
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              将各分组的标量结果按行绑合成新的干净输出 DataFrame。
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Configuration Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-lg p-5 space-y-4">
            {/* Group By Columns */}
            <div>
              <div className="text-xs font-bold text-slate-900 mb-2">
                1. 选择分组变量 (group_by 列)：
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {currentDataset.columns.map((col) => {
                  const isChecked = groupByCols.includes(col.name);
                  return (
                    <label
                      key={col.name}
                      className={`flex items-center gap-2 p-1.5 border rounded cursor-pointer text-xs ${
                        isChecked
                          ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 font-medium'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setGroupByCols(groupByCols.filter((c) => c !== col.name));
                          } else {
                            setGroupByCols([...groupByCols, col.name]);
                          }
                        }}
                        className="rounded text-indigo-600 focus:ring-0"
                      />
                      <span className="font-mono text-[11px] truncate">{col.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Aggregation Targets */}
            <div className="border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900">
                  2. 聚合统计量配置 (summarise)：
                </span>
                <button
                  onClick={addAggregation}
                  className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded text-slate-800"
                >
                  <Plus className="w-3 h-3" />
                  <span>添加统计量</span>
                </button>
              </div>

              <div className="space-y-2">
                {aggregations.map((agg, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-slate-50 border border-slate-200/80 rounded grid grid-cols-12 gap-1.5 items-center text-xs"
                  >
                    <select
                      value={agg.column}
                      onChange={(e) => {
                        const newAggs = [...aggregations];
                        newAggs[idx].column = e.target.value;
                        setAggregations(newAggs);
                      }}
                      className="col-span-4 bg-white border border-slate-300 rounded px-1.5 py-1 text-xs font-mono"
                    >
                      {currentDataset.columns.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={agg.fn}
                      onChange={(e) => {
                        const newAggs = [...aggregations];
                        newAggs[idx].fn = e.target.value as AggregationFunction;
                        setAggregations(newAggs);
                      }}
                      className="col-span-3 bg-white border border-slate-300 rounded px-1 py-1 text-xs font-mono font-semibold"
                    >
                      <option value="mean">mean()</option>
                      <option value="sum">sum()</option>
                      <option value="count">n()</option>
                      <option value="sd">sd()</option>
                      <option value="median">median()</option>
                      <option value="min">min()</option>
                      <option value="max">max()</option>
                      <option value="n_distinct">n_distinct()</option>
                    </select>

                    <input
                      type="text"
                      value={agg.alias}
                      onChange={(e) => {
                        const newAggs = [...aggregations];
                        newAggs[idx].alias = e.target.value;
                        setAggregations(newAggs);
                      }}
                      className="col-span-3 bg-white border border-slate-300 rounded px-1.5 py-1 text-xs font-mono"
                      placeholder="别名"
                    />

                    <div className="col-span-2 flex items-center justify-end gap-1">
                      <label className="flex items-center gap-0.5 text-[10px] text-slate-500" title="na.rm = TRUE">
                        <input
                          type="checkbox"
                          checked={agg.naRm}
                          onChange={(e) => {
                            const newAggs = [...aggregations];
                            newAggs[idx].naRm = e.target.checked;
                            setAggregations(newAggs);
                          }}
                        />
                        <span>na.rm</span>
                      </label>
                      <button
                        onClick={() => removeAggregation(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ungroup Toggle & Warning */}
            <div className="border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between p-3 rounded-lg border transition-colors bg-slate-50">
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    显式安全解除分组 (ungroup / .groups = "drop")
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {dropGroups
                      ? '已启用安全解组：清除分组元数据，保障后续 mutate 全局计算正常'
                      : '已关闭解组：数据框保留 groups 属性，后续跨组统计将严重失真！'}
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={dropGroups}
                  onChange={(e) => setDropGroups(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-0 cursor-pointer"
                />
              </div>

              {!dropGroups && (
                <div className="mt-2.5 p-3 bg-amber-50 border border-amber-200/90 rounded text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>高危预警 (Forgotten ungroup)</strong>：
                    在未解组状态下，后续若调用 <code>mutate(share = total / sum(total))</code>，
                    其求和作用域仍限制在单个组内部，计算得出的 <code>share</code> 将荒谬地全部等于 1.0 (100%)！
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* R Code Output */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-2">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-slate-600" />
                <span>实时生成的 R 管道聚合代码：</span>
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 transition-colors"
              >
                {copiedCode ? <Check className="w-3 h-3 text-teal-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? '已复制' : '复制代码'}</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded font-mono text-xs overflow-x-auto leading-relaxed">
              {generatedRCode}
            </pre>
          </div>
        </div>

        {/* Right: Aggregation Table Result */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-slate-900">
                汇总统计表输出 (Summarised Tibble)
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span>分组数: {resultDf.data.length}</span>
                <span aria-hidden="true">·</span>
                <span>统计维度: {aggregations.length}</span>
              </div>
            </div>

            <TableViewer
              df={resultDf}
              maxRows={10}
              title="分组聚合结果表"
              subtitle={`按 [${groupByCols.join(', ')}] 分组`}
            />
          </div>

          {/* Visual Bucket Breakdowns */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-4 space-y-3">
            <div className="text-xs font-bold text-slate-900">
              分箱子集样本分布一览 (Bucket Observation Density)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(groupedBuckets).map(([groupKey, rows]) => (
                <div key={groupKey} className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs">
                  <div className="font-mono font-semibold text-slate-800 truncate" title={groupKey}>
                    {groupKey}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-1 flex items-center justify-between">
                    <span>样本数：</span>
                    <strong className="text-slate-900 font-mono">{rows.length} 观测</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
