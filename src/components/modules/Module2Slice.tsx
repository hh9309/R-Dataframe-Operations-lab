import React, { useState, useMemo } from 'react';
import { TableViewer } from '../TableViewer';
import { allDatasets, ecommerceDataset } from '../../data/datasets';
import { DataFrame, FilterCondition, FilterOperator } from '../../types/dataframe';
import { executeFilter, executeBaseRSlice } from '../../utils/rEngine';
import { Scissors, Code2, Plus, Trash2, Copy, Check, Filter, Grid3X3 } from 'lucide-react';

export const Module2Slice: React.FC = () => {
  const [activeDatasetId, setActiveDatasetId] = useState<string>('df_ecommerce');
  const [sliceMode, setSliceMode] = useState<'matrix_coords' | 'dplyr_pipeline'>('dplyr_pipeline');

  // Base R Coordinate slice state
  const [selectedRows, setSelectedRows] = useState<number[]>([1, 2, 3, 4, 5]); // 1-based R indexes
  const [selectedCols, setSelectedCols] = useState<string[]>([
    'customer_id',
    'recency_days',
    'frequency',
    'monetary_rmb',
  ]);

  // dplyr pipeline slice state
  const [conditions, setConditions] = useState<FilterCondition[]>([
    {
      id: 'c1',
      column: 'monetary_rmb',
      operator: '>=',
      value: 5000,
      logic: '&',
    },
    {
      id: 'c2',
      column: 'recency_days',
      operator: '<=',
      value: 30,
      logic: '&',
    },
  ]);

  const [selectColumns, setSelectColumns] = useState<string[]>([
    'customer_id',
    'recency_days',
    'frequency',
    'monetary_rmb',
    'membership_tier',
  ]);

  const [copiedCode, setCopiedCode] = useState(false);

  // Active dataset
  const currentDataset = useMemo(() => {
    return allDatasets.find((d) => d.id === activeDatasetId) || ecommerceDataset;
  }, [activeDatasetId]);

  // Compute results
  const slicedResult = useMemo(() => {
    if (sliceMode === 'matrix_coords') {
      return executeBaseRSlice(currentDataset, selectedRows, selectedCols);
    } else {
      // 1. Filter
      const filtered = executeFilter(currentDataset, conditions);
      // 2. Select columns
      const cols = currentDataset.columns.filter((c) => selectColumns.includes(c.name));
      const projectedData = filtered.data.map((row) => {
        const obj: Record<string, any> = {};
        selectColumns.forEach((cName) => {
          obj[cName] = row[cName];
        });
        return obj;
      });

      return {
        ...filtered,
        columns: cols,
        data: projectedData,
      };
    }
  }, [currentDataset, sliceMode, selectedRows, selectedCols, conditions, selectColumns]);

  // Generate R code
  const generatedRCode = useMemo(() => {
    if (sliceMode === 'matrix_coords') {
      const rowExpr =
        selectedRows.length === currentDataset.data.length
          ? ''
          : selectedRows.length > 3
          ? `c(${selectedRows.slice(0, 3).join(', ')}, ... [共${selectedRows.length}行])`
          : `c(${selectedRows.join(', ')})`;
      const colExpr = `c("${selectedCols.join('", "')}")`;
      return `# ==============================================================================
# Base R Matrix Subscript Slicing [i, j]
# Ready to run directly in RStudio / R CLI without external dependencies
# ==============================================================================
library(tibble)

# 1. Sample Dataset Initialization
${activeDatasetId} <- tibble(
  customer_id = c("CUST-1001", "CUST-1002", "CUST-1003", "CUST-1004", "CUST-1005", "CUST-1006"),
  recency_days = c(4, 12, 85, 150, 8, 22),
  frequency = c(28, 19, 3, 1, 35, 12),
  monetary_rmb = c(14200.5, 8650.0, 720.0, 199.0, 21800.0, 5400.0),
  membership_tier = factor(c("VIP", "Gold", "Standard", "Standard", "VIP", "Silver"))
)

# 2. Base R 1-Based 2D Subscript Slicing [row_indices, col_names]
sub_df <- ${activeDatasetId}[${selectedRows.length > 0 ? `c(${selectedRows.join(', ')})` : ''}, ${colExpr}]

print(sub_df)
cat("Dimension [rows, cols]:", dim(sub_df), "\\n")`;
    } else {
      const filterLines = conditions
        .map((c) => {
          if (c.operator === 'between') {
            return `between(${c.column}, ${c.value}, ${c.value2 || 100})`;
          } else if (c.operator === '%in%') {
            return `${c.column} %in% c("${c.value}")`;
          } else if (c.operator === '!is.na' || c.operator === 'is.na') {
            return `${c.operator}(${c.column})`;
          } else {
            return `${c.column} ${c.operator} ${typeof c.value === 'string' ? `"${c.value}"` : c.value}`;
          }
        })
        .join(',\n    ');

      const selectColsStr = selectColumns.map((c) => `"${c}"`).join(', ');

      return `# ==============================================================================
# R tidyverse dplyr Slicing & Column Selection
# Ready to run directly in RStudio / R CLI without external dependencies
# ==============================================================================
library(dplyr)
library(tibble)

# 1. Sample Dataset Initialization
${activeDatasetId} <- tibble(
  customer_id = c("CUST-1001", "CUST-1002", "CUST-1003", "CUST-1004", "CUST-1005", "CUST-1006"),
  recency_days = c(4, 12, 85, 150, 8, 22),
  frequency = c(28, 19, 3, 1, 35, 12),
  monetary_rmb = c(14200.5, 8650.0, 720.0, 199.0, 21800.0, 5400.0),
  membership_tier = factor(c("VIP", "Gold", "Standard", "Standard", "VIP", "Silver"))
)

# 2. Declarative Pipeline Slicing
sliced_df <- ${activeDatasetId} %>%
  # Filter observations by composite conditions
  filter(
    ${filterLines || 'TRUE'}
  ) %>%
  # Select projected variables
  select(any_of(c(${selectColsStr})))

print(sliced_df)
glimpse(sliced_df)`;
    }
  }, [sliceMode, activeDatasetId, selectedRows, selectedCols, conditions, selectColumns, currentDataset]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedRCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const addCondition = () => {
    const firstCol = currentDataset.columns[0].name;
    setConditions([
      ...conditions,
      {
        id: `c_${Date.now()}`,
        column: firstCol,
        operator: '==',
        value: '',
        logic: '&',
      },
    ]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>模块 02</span>
              <span aria-hidden="true">·</span>
              <span>高维子集提取</span>
              <span aria-hidden="true">·</span>
              <span>[row, col] 底标与 dplyr::filter 声明式切片</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              交互式索引、切片与条件过滤
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              基于 R 语言 <code>dplyr::filter()</code>、<code>select()</code> 与底标 <code>[row, col]</code> 语法，实现多维度高效子集提取与精准切片。
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Dataset Selector */}
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

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md shrink-0">
              <button
                onClick={() => setSliceMode('dplyr_pipeline')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  sliceMode === 'dplyr_pipeline'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>dplyr 管道切片</span>
              </button>
              <button
                onClick={() => setSliceMode('matrix_coords')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  sliceMode === 'matrix_coords'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>2D矩阵坐标底标 [i, j]</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Controls Panel */}
        <div className="lg:col-span-5 space-y-4">
          {sliceMode === 'dplyr_pipeline' ? (
            <div className="bg-white border border-slate-200/90 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-indigo-600" />
                  <span>dplyr::filter() 行过滤谓词配置</span>
                </span>
                <button
                  onClick={addCondition}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded text-slate-800 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>添加条件</span>
                </button>
              </div>

              {conditions.length === 0 ? (
                <div className="text-xs text-slate-400 py-3 text-center border border-dashed border-slate-200 rounded">
                  未配置行过滤条件（保留全表行）
                </div>
              ) : (
                <div className="space-y-2.5">
                  {conditions.map((cond, idx) => (
                    <div
                      key={cond.id}
                      className="p-2.5 bg-slate-50 border border-slate-200/80 rounded space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-slate-500 font-semibold">
                          条件 #{idx + 1}
                        </span>
                        <button
                          onClick={() => removeCondition(cond.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                          title="删除条件"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-12 gap-1.5">
                        <select
                          value={cond.column}
                          onChange={(e) => {
                            const newCols = [...conditions];
                            newCols[idx].column = e.target.value;
                            setConditions(newCols);
                          }}
                          className="col-span-5 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono"
                        >
                          {currentDataset.columns.map((c) => (
                            <option key={c.name} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>

                        <select
                          value={cond.operator}
                          onChange={(e) => {
                            const newCols = [...conditions];
                            newCols[idx].operator = e.target.value as FilterOperator;
                            setConditions(newCols);
                          }}
                          className="col-span-3 bg-white border border-slate-300 rounded px-1.5 py-1 text-xs font-mono text-center font-bold"
                        >
                          <option value="==">==</option>
                          <option value="!=">!=</option>
                          <option value=">">&gt;</option>
                          <option value=">=">&gt;=</option>
                          <option value="<">&lt;</option>
                          <option value="<=">&lt;=</option>
                          <option value="%in%">%in%</option>
                          <option value="!is.na">!is.na</option>
                          <option value="is.na">is.na</option>
                          <option value="starts_with">starts</option>
                        </select>

                        {cond.operator !== 'is.na' && cond.operator !== '!is.na' && (
                          <input
                            type="text"
                            placeholder="设定比较值..."
                            value={cond.value}
                            onChange={(e) => {
                              const newCols = [...conditions];
                              newCols[idx].value = e.target.value;
                              setConditions(newCols);
                            }}
                            className="col-span-4 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Select Column Projection */}
              <div className="border-t border-slate-100 pt-3">
                <div className="text-xs font-bold text-slate-900 mb-2">
                  dplyr::select() 属性列投影
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {currentDataset.columns.map((col) => {
                    const isChecked = selectColumns.includes(col.name);
                    return (
                      <label
                        key={col.name}
                        className={`flex items-center gap-2 p-1.5 border rounded cursor-pointer transition-colors text-xs ${
                          isChecked
                            ? 'bg-indigo-50/60 border-indigo-300 text-indigo-950 font-medium'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              if (selectColumns.length > 1) {
                                setSelectColumns(selectColumns.filter((c) => c !== col.name));
                              }
                            } else {
                              setSelectColumns([...selectColumns, col.name]);
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
            </div>
          ) : (
            /* Matrix Coordinates Slicing Board */
            <div className="bg-white border border-slate-200/90 rounded-lg p-5 space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Grid3X3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Base R 二维下标切片坐标板 [row_idxs, col_names]</span>
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  R 语言采用 1-based 索引。支持行号向量、负向剔除 (如 -c(1:3))。
                </p>
              </div>

              {/* Row Selector Matrix */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <span>选择行索引 (Row Subscript i ∈ [1, {currentDataset.data.length}])：</span>
                  <div className="flex gap-1 text-[11px]">
                    <button
                      onClick={() => setSelectedRows([1, 2, 3, 4, 5])}
                      className="text-indigo-600 hover:underline"
                    >
                      前5行
                    </button>
                    <span>·</span>
                    <button
                      onClick={() => setSelectedRows(Array.from({ length: Math.min(10, currentDataset.data.length) }, (_, i) => i + 1))}
                      className="text-indigo-600 hover:underline"
                    >
                      前10行
                    </button>
                    <span>·</span>
                    <button
                      onClick={() => setSelectedRows(Array.from({ length: currentDataset.data.length }, (_, i) => i + 1))}
                      className="text-indigo-600 hover:underline"
                    >
                      全选
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-1 bg-slate-50 p-2 rounded border border-slate-200 max-h-36 overflow-y-auto">
                  {currentDataset.data.map((_, idx) => {
                    const rNum = idx + 1;
                    const isSelected = selectedRows.includes(rNum);
                    return (
                      <button
                        key={rNum}
                        onClick={() => {
                          if (isSelected) {
                            if (selectedRows.length > 1) {
                              setSelectedRows(selectedRows.filter((r) => r !== rNum));
                            }
                          } else {
                            setSelectedRows([...selectedRows, rNum].sort((a, b) => a - b));
                          }
                        }}
                        className={`py-1 text-center font-mono text-xs rounded transition-colors ${
                          isSelected
                            ? 'bg-slate-900 text-white font-bold'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        #{rNum}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Column Selector */}
              <div>
                <div className="text-xs font-semibold text-slate-700 mb-1.5">
                  选择列变量 (Column Subscript j)：
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {currentDataset.columns.map((col) => {
                    const isSelected = selectedCols.includes(col.name);
                    return (
                      <label
                        key={col.name}
                        className={`flex items-center gap-2 p-1.5 border rounded cursor-pointer text-xs ${
                          isSelected
                            ? 'bg-teal-50/60 border-teal-300 text-teal-950 font-medium'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              if (selectedCols.length > 1) {
                                setSelectedCols(selectedCols.filter((c) => c !== col.name));
                              }
                            } else {
                              setSelectedCols([...selectedCols, col.name]);
                            }
                          }}
                          className="rounded text-teal-600"
                        />
                        <span className="font-mono text-[11px] truncate">{col.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* R Code Output */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-2">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-slate-600" />
                <span>实时生成的 R 切片代码：</span>
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

        {/* Right: Sliced Result View */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-slate-900">
                切片子集实时预览 (Sub-DataFrame View)
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span>
                  原始: {currentDataset.data.length}行 × {currentDataset.columns.length}列
                </span>
                <span aria-hidden="true">→</span>
                <span className="text-indigo-600 font-bold">
                  切片后: {slicedResult.data.length}行 × {slicedResult.columns.length}列
                </span>
              </div>
            </div>

            <TableViewer
              df={slicedResult}
              maxRows={8}
              title={`${currentDataset.name.split(' ')[0]} (切片结果)`}
              subtitle={`当前匹配率: ${((slicedResult.data.length / currentDataset.data.length) * 100).toFixed(1)}%`}
            />
          </div>

          {/* Mathematical & Academic Concept Callout */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-4 text-xs text-slate-700 space-y-2">
            <div className="font-semibold text-slate-900">💡 R 语言索引切片核心代数原理：</div>
            <p className="leading-relaxed">
              在 R 中，<code>[i, j]</code> 是泛型下标操作符。与 Python (0-based, 左闭右开) 相比，R
              采用<strong>基于 1 的完全代数坐标系</strong>，支持四种切片类型：
              <strong>正整数切片</strong>（提取指定位置）、
              <strong>负整数切片</strong>（如 <code>df[-c(1, 2), ]</code> 排除对应行）、
              <strong>布尔逻辑向量切片</strong>（如 <code>df[df$val &gt; 50, ]</code>，遇 NA 将产生全 NA 行！）、以及
              <strong>字符向量列名切片</strong>。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
