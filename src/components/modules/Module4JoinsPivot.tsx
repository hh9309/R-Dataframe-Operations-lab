import React, { useState, useMemo } from 'react';
import { TableViewer } from '../TableViewer';
import { warehouseInventoryDataset, warehouseShipmentsDataset } from '../../data/datasets';
import { JoinType } from '../../types/dataframe';
import { executeJoin, executePivotLonger, executePivotWider } from '../../utils/rEngine';
import { GitMerge, ArrowLeftRight, Code2, AlertTriangle, Copy, Check, Info } from 'lucide-react';

export const Module4JoinsPivot: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'joins' | 'pivot'>('joins');

  // Joins state
  const [joinType, setJoinType] = useState<JoinType>('inner_join');
  const [joinKey, setJoinKey] = useState<string>('sku_id');

  // Pivot state
  const [pivotMode, setPivotMode] = useState<'longer' | 'wider'>('longer');
  const [copiedCode, setCopiedCode] = useState(false);

  // Joins Execution
  const { joinedDf, leftUnmatched, rightUnmatched, cartesianRisk } = useMemo(() => {
    return executeJoin(warehouseInventoryDataset, warehouseShipmentsDataset, joinType, joinKey);
  }, [joinType, joinKey]);

  // Pivot Execution Sample (Quarterly sales)
  const wideSampleDf = useMemo(() => {
    return {
      id: 'df_quarterly_sales',
      name: 'df_quarterly (多季度销售额宽表)',
      description: '典型的非整洁宽表，Q1至Q4作为独立列',
      columns: [
        { name: 'product', type: 'character' as const, label: '产品品类' },
        { name: 'region', type: 'factor' as const, label: '销售区域' },
        { name: 'Q1_sales', type: 'numeric' as const, label: '一季度销售' },
        { name: 'Q2_sales', type: 'numeric' as const, label: '二季度销售' },
        { name: 'Q3_sales', type: 'numeric' as const, label: '三季度销售' },
        { name: 'Q4_sales', type: 'numeric' as const, label: '四季度销售' },
      ],
      data: [
        { product: 'Sensor_Pro', region: 'East', Q1_sales: 120.5, Q2_sales: 135.2, Q3_sales: 180.0, Q4_sales: 210.4 },
        { product: 'Sensor_Pro', region: 'North', Q1_sales: 88.0, Q2_sales: 95.4, Q3_sales: 110.2, Q4_sales: 140.0 },
        { product: 'Actuator_X', region: 'East', Q1_sales: 240.0, Q2_sales: 260.8, Q3_sales: 310.0, Q4_sales: 350.5 },
        { product: 'Actuator_X', region: 'North', Q1_sales: 190.5, Q2_sales: 210.0, Q3_sales: 225.4, Q4_sales: 280.0 },
      ],
    };
  }, []);

  const pivotedDf = useMemo(() => {
    if (pivotMode === 'longer') {
      return executePivotLonger(
        wideSampleDf,
        ['Q1_sales', 'Q2_sales', 'Q3_sales', 'Q4_sales'],
        'quarter',
        'revenue'
      );
    } else {
      // Revert long to wide
      const longFirst = executePivotLonger(
        wideSampleDf,
        ['Q1_sales', 'Q2_sales', 'Q3_sales', 'Q4_sales'],
        'quarter',
        'revenue'
      );
      return executePivotWider(longFirst, 'quarter', 'revenue');
    }
  }, [pivotMode, wideSampleDf]);

  // Generated R Code
  const generatedRCode = useMemo(() => {
    if (activeTab === 'joins') {
      return `# ==============================================================================
# R tidyverse Joins: Multi-Table Relational Join Simulation
# Ready to run directly in RStudio / R CLI without external dependencies
# ==============================================================================
library(dplyr)
library(tibble)

# 1. Standalone Sample Tables
df_inventory <- tibble(
  sku_id = c("SKU-801", "SKU-802", "SKU-803", "SKU-804", "SKU-807", "SKU-808"),
  warehouse_code = factor(c("WH_East", "WH_East", "WH_East", "WH_North", "WH_South", "WH_South")),
  on_hand_qty = c(450, 80, 1200, 310, 15, 850)
)

df_shipments <- tibble(
  sku_id = c("SKU-801", "SKU-802", "SKU-803", "SKU-804", "SKU-807", "SKU-899"),
  monthly_shipped_qty = c(900, 450, 320, 680, 520, 85)
)

# 2. Execute Relational Join (join type: ${joinType}, by = "${joinKey}")
merged_inventory <- ${joinType}(
  x = df_inventory,
  y = df_shipments,
  by = "${joinKey}"
)

print(merged_inventory)
cat("Output rows count:", nrow(merged_inventory), "\\n")`;
    } else {
      if (pivotMode === 'longer') {
        return `# ==============================================================================
# R tidyr Reshaping: Wide to Long Format for ggplot2
# Ready to run directly in RStudio / R CLI without external dependencies
# ==============================================================================
library(tidyr)
library(dplyr)
library(ggplot2)
library(tibble)

# 1. Standalone Sample Wide Table
df_quarterly <- tibble(
  product = c("Sensor_Pro", "Actuator_X", "Sensor_Pro", "Actuator_X"),
  region = factor(c("East", "East", "North", "North")),
  Q1_sales = c(120.5, 240.0, 88.0, 190.5),
  Q2_sales = c(135.2, 260.8, 95.4, 210.0),
  Q3_sales = c(180.0, 310.0, 110.2, 225.4),
  Q4_sales = c(210.4, 350.5, 140.0, 280.0)
)

# 2. Sinking Columns to Clean Tidy Long Format
tidy_long <- df_quarterly %>%
  pivot_longer(
    cols = starts_with("Q"),
    names_to = "quarter",
    values_to = "revenue"
  )

# 3. ggplot2 Visual Representation (English Titles, Axes, Legends)
ggplot(tidy_long, aes(x = quarter, y = revenue, fill = product)) +
  geom_col(position = "dodge", width = 0.6) +
  scale_fill_manual(values = c("Sensor_Pro" = "#0284c7", "Actuator_X" = "#d97706")) +
  labs(
    title = "Quarterly Product Revenue Comparison",
    subtitle = "Reshaped via tidyr::pivot_longer into Tidy Data Format",
    x = "Fiscal Quarter",
    y = "Quarterly Revenue (RMB)",
    fill = "Product Line"
  ) +
  theme_minimal(base_size = 11)

print(tidy_long)`;
      } else {
        return `# ==============================================================================
# R tidyr Reshaping: Long to Wide Pivot (Cross-Tabulation)
# Ready to run directly in RStudio / R CLI without external dependencies
# ==============================================================================
library(tidyr)
library(dplyr)
library(tibble)

# 1. Standalone Long Table
df_long <- tibble(
  product = rep(c("Sensor_Pro", "Actuator_X"), each = 4),
  quarter = rep(c("Q1_sales", "Q2_sales", "Q3_sales", "Q4_sales"), 2),
  revenue = c(120.5, 135.2, 180.0, 210.4, 240.0, 260.8, 310.0, 350.5)
)

# 2. Pivot Wider to Cross-Tab
wide_table <- df_long %>%
  pivot_wider(
    names_from = quarter,
    values_from = revenue
  )

print(wide_table)`;
      }
    }
  }, [activeTab, joinType, joinKey, pivotMode]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedRCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const JOIN_DESCRIPTIONS: Record<JoinType, { name: string; desc: string; math: string }> = {
    left_join: {
      name: '左连接 (left_join)',
      desc: '保留左表所有观测行。若右表无匹配键，则对应属性填充 NA。在订单关联客户信息时最常用。',
      math: 'X ⟕ Y (全保留 X，补齐 Y)',
    },
    inner_join: {
      name: '内连接 (inner_join)',
      desc: '严格保留左右两表键均匹配的行。丢弃所有未匹配的孤儿记录。用于纯交集业务核算。',
      math: 'X ⨝ Y (仅保留键交集 X ∩ Y)',
    },
    right_join: {
      name: '右连接 (right_join)',
      desc: '保留右表所有行，左表未匹配填 NA。在数学上等价于颠倒参数顺序的 left_join(y, x)。',
      math: 'X ⟖ Y (全保留 Y，补齐 X)',
    },
    full_join: {
      name: '全外连接 (full_join)',
      desc: '保留两表所有行。任意一侧缺失则对应列填 NA。常用于跨业务系统的数据完整性对账。',
      math: 'X ⟗ Y (并集 X ∪ Y)',
    },
    semi_join: {
      name: '半连接 (semi_join 筛选算子)',
      desc: '极为重要的过滤算子！仅保留在右表中出现过的左表行，但绝不引入右表的任何列！绝无笛卡尔积乘积膨胀风险。',
      math: '{x ∈ X | ∃y ∈ Y, x.key = y.key}',
    },
    anti_join: {
      name: '反向差集连接 (anti_join 稽核算子)',
      desc: '差集排查神器！仅保留在右表中未出现的左表行。广泛用于孤儿物料、漏发货、失配订单稽核。',
      math: '{x ∈ X | ∄y ∈ Y, x.key = y.key}',
    },
  };

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>模块 04</span>
              <span aria-hidden="true">·</span>
              <span>关系代数与形态重构</span>
              <span aria-hidden="true">·</span>
              <span>dplyr Joins & tidyr Pivot</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              多表连接 (Joins) 与长宽表转化
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              动态演播 <code>left_join</code>、<code>inner_join</code>、<code>anti_join</code> 等六大连接及 <code>pivot_longer</code> / <code>pivot_wider</code> 数据重塑与变形过程。
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md shrink-0">
            <button
              onClick={() => setActiveTab('joins')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'joins'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitMerge className="w-3.5 h-3.5" />
              <span>多表连接 (Joins)</span>
            </button>
            <button
              onClick={() => setActiveTab('pivot')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'pivot'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>长宽表重塑 (Pivot)</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'joins' && (
        <div className="space-y-6">
          {/* Join Selector Buttons */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-4">
            <div className="text-xs font-bold text-slate-900 mb-2">选择连接算子：</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {(Object.keys(JOIN_DESCRIPTIONS) as JoinType[]).map((jKey) => {
                const isSelected = joinType === jKey;
                return (
                  <button
                    key={jKey}
                    onClick={() => setJoinType(jKey)}
                    className={`p-2.5 text-left border rounded transition-colors ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/70 text-indigo-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-mono font-semibold">{jKey}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {JOIN_DESCRIPTIONS[jKey].name.split(' ')[0]}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Operator Explanation Card */}
            <div className="mt-3 p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="flex items-center justify-between font-semibold text-slate-900">
                <span>{JOIN_DESCRIPTIONS[joinType].name}</span>
                <span className="font-mono text-indigo-600 text-[11px]">
                  代数表达式: {JOIN_DESCRIPTIONS[joinType].math}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {JOIN_DESCRIPTIONS[joinType].desc}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Input Tables Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-slate-200/90 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>左表 X: df_inventory (现存在库)</span>
                  <span className="font-mono text-slate-400">10 行</span>
                </div>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded text-xs">
                  <table className="w-full font-mono text-[11px]">
                    <thead className="bg-slate-100 text-slate-700 sticky top-0">
                      <tr>
                        <th className="py-1 px-2 text-left bg-indigo-50 text-indigo-900">sku_id (键)</th>
                        <th className="py-1 px-2 text-left">warehouse</th>
                        <th className="py-1 px-2 text-right">on_hand</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {warehouseInventoryDataset.data.slice(0, 6).map((r, i) => (
                        <tr key={i}>
                          <td className="py-1 px-2 font-bold text-indigo-700">{r.sku_id}</td>
                          <td className="py-1 px-2 text-slate-600">{r.warehouse_code}</td>
                          <td className="py-1 px-2 text-right tabular-nums">{r.on_hand_qty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>右表 Y: df_shipments (发货流水)</span>
                  <span className="font-mono text-slate-400">9 行</span>
                </div>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded text-xs">
                  <table className="w-full font-mono text-[11px]">
                    <thead className="bg-slate-100 text-slate-700 sticky top-0">
                      <tr>
                        <th className="py-1 px-2 text-left bg-teal-50 text-teal-900">sku_id (键)</th>
                        <th className="py-1 px-2 text-right">monthly_shipped</th>
                        <th className="py-1 px-2 text-right">orders</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {warehouseShipmentsDataset.data.slice(0, 6).map((r, i) => (
                        <tr key={i}>
                          <td className="py-1 px-2 font-bold text-teal-700">{r.sku_id}</td>
                          <td className="py-1 px-2 text-right tabular-nums">{r.monthly_shipped_qty}</td>
                          <td className="py-1 px-2 text-right tabular-nums">{r.order_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* R Code Reflection */}
              <div className="bg-white border border-slate-200/90 rounded-lg p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-slate-600" />
                    <span>生成的 R 代码：</span>
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-teal-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? '已复制代码' : '复制代码'}</span>
                  </button>
                </div>
                <pre className="bg-slate-900 text-slate-100 p-3 rounded font-mono text-xs overflow-x-auto leading-relaxed">
                  {generatedRCode}
                </pre>
              </div>
            </div>

            {/* Right: Join Result Table */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white border border-slate-200/90 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-slate-900">
                    多表连接输出结果 ({joinType})
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <span>生成: {joinedDf.data.length} 行</span>
                    <span aria-hidden="true">·</span>
                    <span>左未匹配: {leftUnmatched}</span>
                    <span aria-hidden="true">·</span>
                    <span>右未匹配: {rightUnmatched}</span>
                  </div>
                </div>

                {cartesianRisk && (
                  <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>警惕笛卡尔积乘积爆炸风险！结果行数明显超出单表基数。</span>
                  </div>
                )}

                <TableViewer
                  df={joinedDf}
                  maxRows={10}
                  title={`${joinType}(inventory, shipments)`}
                  subtitle={`键字段: by = "${joinKey}"`}
                />
              </div>

              {/* Special Join Explanation Note */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700">
                <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-indigo-600" />
                  <span>semi_join 与 anti_join 的特殊魔力：</span>
                </div>
                <p className="leading-relaxed">
                  这两个算子被称为<strong>“过滤连接 (Filtering Joins)”</strong>。它们不会像常规连接那样将两个表的列拼在一起，而是将右表纯粹作为一把“筛子”对左表进行行提取。例如
                  <code>anti_join(shipments, inventory)</code> 可以瞬间找出在发货流水中存在、但在物理仓库中缺失的幽灵异常物料。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pivot' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-lg p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  长宽表重塑 (tidyr::pivot_longer / pivot_wider) 动态演示
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  长表适合统计建模与 ggplot2 图层映射；宽表适合打印交叉报表。
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
                <button
                  onClick={() => setPivotMode('longer')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    pivotMode === 'longer' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  宽表 → 长表 (pivot_longer)
                </button>
                <button
                  onClick={() => setPivotMode('wider')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    pivotMode === 'wider' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  长表 → 宽表 (pivot_wider)
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Source Table */}
            <div className="bg-white border border-slate-200/90 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  {pivotMode === 'longer' ? '原始宽表形态 (Untidy Wide Table)' : '原始长表形态 (Tidy Long Table)'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {wideSampleDf.data.length} 行 × {wideSampleDf.columns.length} 列
                </span>
              </div>
              <TableViewer df={wideSampleDf} maxRows={6} title="宽表输入" />
            </div>

            {/* Pivoted Table */}
            <div className="bg-white border border-slate-200/90 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-800">
                  {pivotMode === 'longer'
                    ? '重塑为整洁长表 (Pivoted to Long Format)'
                    : '透视展开为宽表 (Pivoted to Wide Format)'}
                </span>
                <span className="text-xs text-teal-700 font-mono">
                  {pivotedDf.data.length} 行 × {pivotedDf.columns.length} 列
                </span>
              </div>
              <TableViewer df={pivotedDf} maxRows={10} title="重塑输出结果" />
            </div>
          </div>

          {/* R Code Reflection */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-2">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-slate-600" />
                <span>R 语言重塑脚本与 ggplot2 对接：</span>
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900"
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
      )}
    </div>
  );
};
