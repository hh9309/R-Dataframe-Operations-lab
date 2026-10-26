import React, { useState } from 'react';
import { TableViewer } from '../TableViewer';
import { ecommerceDataset } from '../../data/datasets';
import { Layers, Check, ArrowRight, Database, Code2, AlertTriangle, Cpu } from 'lucide-react';

export const Module1Algebra: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'algebra' | 'types' | 'tidy_vs_messy'>('algebra');
  const [selectedElement, setSelectedElement] = useState<'row' | 'col' | 'val'>('col');

  // Interactive Messy vs Tidy state
  const messyData = [
    { customer: 'Alice', Product_A_2026: 120, Product_B_2026: 350 },
    { customer: 'Bob', Product_A_2026: 80, Product_B_2026: 410 },
    { customer: 'Charlie', Product_A_2026: 210, Product_B_2026: 190 },
  ];

  const tidyData = [
    { customer: 'Alice', product: 'Product_A', year: 2026, sales: 120 },
    { customer: 'Alice', product: 'Product_B', year: 2026, sales: 350 },
    { customer: 'Bob', product: 'Product_A', year: 2026, sales: 80 },
    { customer: 'Bob', product: 'Product_B', year: 2026, sales: 410 },
    { customer: 'Charlie', product: 'Product_A', year: 2026, sales: 210 },
    { customer: 'Charlie', product: 'Product_B', year: 2026, sales: 190 },
  ];

  const tidyColumns = [
    { name: 'customer', type: 'character' as const, label: '客户实体' },
    { name: 'product', type: 'factor' as const, label: '产品品类' },
    { name: 'year', type: 'integer' as const, label: '测算年份' },
    { name: 'sales', type: 'numeric' as const, label: '销售额 (元)' },
  ];

  return (
    <div className="space-y-6">
      {/* Module Banner / Header */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>模块 01</span>
              <span aria-hidden="true">·</span>
              <span>关系代数建模</span>
              <span aria-hidden="true">·</span>
              <span>Hadley Wickham 整洁数据公理</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              表格数据代数与 DataFrame 结构建模
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              形式化构建二维关系表格代数模型，推导行索引、列向量、数据类型转换与整洁数据 (Tidy Data) 的底层代数原理。
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md shrink-0">
            <button
              onClick={() => setActiveTab('algebra')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeTab === 'algebra' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              二维代数结构
            </button>
            <button
              onClick={() => setActiveTab('types')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeTab === 'types' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              R类型系统与内存
            </button>
            <button
              onClick={() => setActiveTab('tidy_vs_messy')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeTab === 'tidy_vs_messy' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              整洁数据三公理
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'algebra' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Mathematical Formulation */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-lg p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-700" />
                <span>形式化二维关系矩表模型</span>
              </h2>

              <div className="bg-slate-900 text-slate-100 p-3.5 rounded-md font-mono text-xs leading-relaxed overflow-x-auto">
                <div className="text-teal-400"># 形式化定义：2D 关系张量</div>
                <div className="mt-1">
                  X ∈ D₁ × D₂ × ... × Dₚ, 其中 X 是 n × p 矩阵
                </div>
                <div className="mt-2 text-slate-400"># 行向量 (Observation i):</div>
                <div className="text-amber-300">x[i, *] = (x_i1, x_i2, ..., x_ip) ∈ Tuple</div>
                <div className="mt-2 text-slate-400"># 列向量 (Variable j, 同构向量):</div>
                <div className="text-indigo-300">x[*, j] = [x_1j, x_2j, ..., x_nj]ᵀ ∈ D_jⁿ</div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="text-xs font-semibold text-slate-700">点击切换剖析维度：</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedElement('col')}
                    className={`p-2.5 text-left border rounded transition-colors ${
                      selectedElement === 'col'
                        ? 'border-indigo-500 bg-indigo-50/50 text-indigo-950 font-medium'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold">1. 列变量</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">同构特征向量</div>
                  </button>
                  <button
                    onClick={() => setSelectedElement('row')}
                    className={`p-2.5 text-left border rounded transition-colors ${
                      selectedElement === 'row'
                        ? 'border-indigo-500 bg-indigo-50/50 text-indigo-950 font-medium'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold">2. 行观测</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">异构属性元组</div>
                  </button>
                  <button
                    onClick={() => setSelectedElement('val')}
                    className={`p-2.5 text-left border rounded transition-colors ${
                      selectedElement === 'val'
                        ? 'border-indigo-500 bg-indigo-50/50 text-indigo-950 font-medium'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold">3. 标量值</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">单元格测定值</div>
                  </button>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                {selectedElement === 'col' && (
                  <div>
                    <strong className="text-slate-900">列向量 (Variable Vectors) 的计算优势：</strong>
                    <p className="mt-1">
                      在 R 语言的内部 C 语言结构体（SEXPREC）中，同质列直接连续存储在连续内存块中。这使
                      <code>mean()</code>、<code>sum()</code> 等操作能直接触发 CPU 的 SIMD
                      向量化并行指令，比逐行遍历快 20~100 倍！
                    </p>
                  </div>
                )}
                {selectedElement === 'row' && (
                  <div>
                    <strong className="text-slate-900">行观测 (Observations / Tuples) 的逻辑单元：</strong>
                    <p className="mt-1">
                      每一行代表一个在物理空间或时间上独立的实体（如一名特定客户、一个特定生产批次）。在整洁数据中，任何两行观测必须具备统计独立性或严格的时间序列因果链。
                    </p>
                  </div>
                )}
                {selectedElement === 'val' && (
                  <div>
                    <strong className="text-slate-900">单元格值 (Atomic Values) 的三值逻辑：</strong>
                    <p className="mt-1">
                      单元格内的标量必须属于指定的数据类型。R 语言的一大特点是原生支持
                      <code>NA</code>（Not Available），其在布尔代数中对应三值逻辑：<code>TRUE & NA = NA</code>、
                      <code>FALSE & NA = FALSE</code>。
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* R Vectorization Architecture */}
            <div className="bg-white border border-slate-200/90 rounded-lg p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-slate-700" />
                <span>R 语言 DataFrame 的对象构成链</span>
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200/70">
                  <span className="font-mono text-indigo-600 font-semibold">Scalar 标量</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span>单一数值或字符 (在 R 中无纯标量，标量即长度为 1 的向量)</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200/70">
                  <span className="font-mono text-indigo-600 font-semibold">Atomic Vector 原子向量</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span>同构元素数组 (c(1, 2, 3), 具有统一的数据类型与连续内存)</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200/70">
                  <span className="font-mono text-indigo-600 font-semibold">Generic List 泛型列表</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span>可容纳不同类型和任意长度对象的异构集合 list()</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-indigo-50/70 rounded border border-indigo-200">
                  <span className="font-mono text-indigo-900 font-semibold">data.frame / tibble</span>
                  <ArrowRight className="w-3 h-3 text-indigo-400" />
                  <span className="font-medium text-indigo-950">
                    本质是一个“等长向量构成的命名列表”，附加 row.names 与 class 属性！
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Live Interactive DataFrame Grid Viewer */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-slate-800">
                  真实 DataFrame 结构投影（当前高亮模式：{selectedElement === 'col' ? '列向量' : selectedElement === 'row' ? '行观测' : '标量值'}）
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  dim(df) = [24, 6]
                </div>
              </div>

              <TableViewer
                df={ecommerceDataset}
                maxRows={6}
                highlightedCols={selectedElement === 'col' ? ['monetary_rmb', 'membership_tier'] : []}
                highlightedRowIndices={selectedElement === 'row' ? [0, 1] : []}
                title="df_ecommerce (标准整洁数据建模实例)"
                subtitle="每个观测对应一名独立客户的年度画像"
              />
            </div>

            {/* R Code Reflection */}
            <div className="bg-white border border-slate-200/90 rounded-lg p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-2">
                <span className="flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>底层数据结构探查的经典 R 命令：</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">tidyverse / base R</span>
              </div>
              <div className="bg-slate-900 text-slate-100 p-3 rounded font-mono text-xs overflow-x-auto leading-relaxed">
                <div className="text-slate-400"># 探查 DataFrame 底层列表属性与列向量属性</div>
                <div>typeof(df_ecommerce)       <span className="text-teal-400"># 返回 "list" (证明其泛型列表本质)</span></div>
                <div>class(df_ecommerce)        <span className="text-teal-400"># 返回 c("tbl_df", "tbl", "data.frame")</span></div>
                <div>attributes(df_ecommerce)   <span className="text-teal-400"># 包含 $names, $row.names, $class</span></div>
                <div className="mt-2 text-slate-400"># 列向量提取语法差异</div>
                <div>df$monetary_rmb            <span className="text-teal-400"># 降级提取为原子数值向量 (vector)</span></div>
                <div>df["monetary_rmb"]         <span className="text-teal-400"># 仍保持 1 列的 data.frame (sub-dataframe)</span></div>
                <div>dplyr::pull(df, monetary_rmb) <span className="text-teal-400"># tidyverse 标准纯净向量提取管道算子</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'types' && (
        <div className="bg-white border border-slate-200/90 rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              R 语言六大核心数据类型与内存机制
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              R 严格区分为连续原子向量、因子离散水平与三值逻辑。理解类型转换是避免管道崩溃的第一步。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  numeric / double &lt;dbl&gt;
                </span>
                <span className="text-[11px] font-mono text-slate-400">64-bit IEEE 754</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-800 mt-2">双精度浮点型</h3>
              <p className="text-xs text-slate-600 mt-1">
                R 语言默认的数值存储格式（如 <code>x &lt;- 42</code> 默认是 double 而不是 integer）。在金融金额、连续测量中普遍使用。
              </p>
              <div className="mt-3 font-mono text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200">
                is.double(42) # TRUE<br />
                typeof(3.14159) # "double"
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                  integer &lt;int&gt;
                </span>
                <span className="text-[11px] font-mono text-slate-400">32-bit Signed</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-800 mt-2">整型数值向量</h3>
              <p className="text-xs text-slate-600 mt-1">
                在字面量后加 <code>L</code> 后缀（如 <code>42L</code>）。用于计数项、索引位与批次流水号，内存占用仅为 double 的一半。
              </p>
              <div className="mt-3 font-mono text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200">
                x &lt;- 42L<br />
                is.integer(x) # TRUE
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  factor &lt;fct&gt;
                </span>
                <span className="text-[11px] font-mono text-slate-400">Int + String Levels</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-800 mt-2">因子类型 (分类变量)</h3>
              <p className="text-xs text-slate-600 mt-1">
                底层存储为整数码，外挂 <code>levels</code> 标签。用于方差分析 (ANOVA)、分组绘图。极易因 level 不匹配导致不可恢复的数据丢失！
              </p>
              <div className="mt-3 font-mono text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200">
                f &lt;- factor(c("Low", "High"))<br />
                levels(f) # c("High", "Low")
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  character &lt;chr&gt;
                </span>
                <span className="text-[11px] font-mono text-slate-400">Global String Pool</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-800 mt-2">字符型文本向量</h3>
              <p className="text-xs text-slate-600 mt-1">
                存储非数值文本，R 使用全局字符串指针池（String Pool）去重存储。读取脏数据时若包含未清洗空格，整列会被降级为 character。
              </p>
              <div className="mt-3 font-mono text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200">
                str &lt;- "PT-001"<br />
                nchar(str) # 6
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  logical &lt;lgl&gt;
                </span>
                <span className="text-[11px] font-mono text-slate-400">Ternary (3-state)</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-800 mt-2">三值布尔逻辑</h3>
              <p className="text-xs text-slate-600 mt-1">
                仅取 <code>TRUE</code>、<code>FALSE</code> 或 <code>NA</code>。在数值运算中 TRUE 自动协变量强制转化为 1，FALSE 转化为 0（如 <code>sum(x &gt; 10)</code>）。
              </p>
              <div className="mt-3 font-mono text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200">
                sum(c(TRUE, FALSE, TRUE)) # 2<br />
                TRUE | NA # TRUE
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  Date / POSIXct &lt;date&gt;
                </span>
                <span className="text-[11px] font-mono text-slate-400">Epoch Offset</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-800 mt-2">时间与日期类型</h3>
              <p className="text-xs text-slate-600 mt-1">
                <code>Date</code> 存储自 1970-01-01 以来的偏移天数；<code>POSIXct</code> 存储自 Unix 纪元以来的偏移秒数。支持代数时间加减。
              </p>
              <div className="mt-3 font-mono text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200">
                as.Date("2026-10-26") - 10<br />
                # "2026-10-16"
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tidy_vs_messy' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-lg p-5">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
              整洁数据 (Tidy Data) 三大公理动态对照
            </h2>
            <div className="text-xs text-slate-600 flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1 font-medium text-slate-900">
                <Check className="w-3.5 h-3.5 text-teal-600" />
                公理 1：每列对应一个单一变量 (Variable)
              </span>
              <span className="flex items-center gap-1 font-medium text-slate-900">
                <Check className="w-3.5 h-3.5 text-teal-600" />
                公理 2：每行对应一个单一观测实体 (Observation)
              </span>
              <span className="flex items-center gap-1 font-medium text-slate-900">
                <Check className="w-3.5 h-3.5 text-teal-600" />
                公理 3：每个单元格对应一个确定测定值 (Value)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Messy Data View */}
            <div className="bg-white border border-rose-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  非整洁宽表 (Messy Data / Untidy)
                </span>
                <span className="text-[11px] font-mono text-slate-400">3 行 × 3 列</span>
              </div>
              <p className="text-xs text-slate-600">
                <strong>致命缺陷</strong>：列名 <code>Product_A_2026</code> 将产品品类与年份拼接成了列名。这不是变量，而是观测值！导致无法按产品统一绘图。
              </p>

              <div className="overflow-x-auto border border-slate-200 rounded">
                <table className="w-full text-xs font-mono">
                  <thead className="bg-rose-50 text-rose-900 border-b border-rose-200">
                    <tr>
                      <th className="py-1.5 px-3 text-left">customer</th>
                      <th className="py-1.5 px-3 text-right bg-rose-100/70">Product_A_2026</th>
                      <th className="py-1.5 px-3 text-right bg-rose-100/70">Product_B_2026</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {messyData.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-1.5 px-3 font-semibold text-slate-800">{r.customer}</td>
                        <td className="py-1.5 px-3 text-right tabular-nums">{r.Product_A_2026}</td>
                        <td className="py-1.5 px-3 text-right tabular-nums">{r.Product_B_2026}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-rose-50/50 rounded border border-rose-200 text-xs text-rose-800">
                ❌ <strong>后果：</strong> 无法使用 <code>ggplot(df, aes(x = product, y = sales))</code>，也无法通过 <code>group_by(product)</code> 聚合求和！
              </div>
            </div>

            {/* Tidy Data View */}
            <div className="bg-white border border-teal-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-800 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                  整洁长表 (Tidy Data - 符合 Hadley 原则)
                </span>
                <span className="text-[11px] font-mono text-slate-400">6 行 × 4 列</span>
              </div>
              <p className="text-xs text-slate-600">
                <strong>整洁重塑</strong>：通过 <code>pivot_longer()</code> 将复合列名下沉分解为 <code>product</code> 与 <code>year</code> 独立变量，解绑销售额数值。
              </p>

              <div className="overflow-x-auto border border-slate-200 rounded">
                <table className="w-full text-xs font-mono">
                  <thead className="bg-teal-50 text-teal-900 border-b border-teal-200">
                    <tr>
                      <th className="py-1.5 px-3 text-left">customer</th>
                      <th className="py-1.5 px-3 text-left">product</th>
                      <th className="py-1.5 px-3 text-right">year</th>
                      <th className="py-1.5 px-3 text-right font-bold">sales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tidyData.map((r, i) => (
                      <tr key={i} className="hover:bg-teal-50/30">
                        <td className="py-1.5 px-3 text-slate-800">{r.customer}</td>
                        <td className="py-1.5 px-3 text-teal-700 font-medium">{r.product}</td>
                        <td className="py-1.5 px-3 text-right tabular-nums text-slate-500">{r.year}</td>
                        <td className="py-1.5 px-3 text-right tabular-nums font-semibold">{r.sales}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-teal-50/50 rounded border border-teal-200 text-xs text-teal-900">
                ✅ <strong>优势：</strong> 完全适配 tidyverse 管道！可直接输入 <code>group_by(product) %&gt;% summarise(total = sum(sales))</code> 与现代统计模型。
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
