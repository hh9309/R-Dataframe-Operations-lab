import React, { useState, useMemo } from 'react';
import { caseStudiesList, allDatasets } from '../../data/datasets';
import { TableViewer } from '../TableViewer';
import { computeOneWayANOVA, computeWelchTTest } from '../../utils/rEngine';
import {
  ShoppingBag,
  Cpu,
  TrendingUp,
  Wind,
  HeartPulse,
  Truck,
  Code2,
  Copy,
  Check,
  Play,
  BarChart3,
  Sparkles,
} from 'lucide-react';

export const Module5Cases: React.FC<{ onNavigateToAIDiagnostics?: () => void }> = ({
  onNavigateToAIDiagnostics,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case_rfm');
  const [copiedCode, setCopiedCode] = useState(false);

  const activeCase = useMemo(() => {
    return caseStudiesList.find((c) => c.id === selectedCaseId) || caseStudiesList[0];
  }, [selectedCaseId]);

  const activeDataset = useMemo(() => {
    return allDatasets.find((d) => d.id === activeCase.datasetId) || allDatasets[0];
  }, [activeCase]);

  // Compute Case Specific Statistical Modeling
  const anovaStats = useMemo(() => {
    if (selectedCaseId !== 'case_anova') return null;
    const mfg = allDatasets.find((d) => d.id === 'df_manufacturing')!;
    const plants = ['Plant_A', 'Plant_B', 'Plant_C', 'Plant_D'];
    const groups = plants.map((p) => ({
      name: p,
      values: mfg.data.filter((r) => r.factory_id === p).map((r) => Number(r.yield_pct)),
    }));
    return computeOneWayANOVA(groups);
  }, [selectedCaseId]);

  const tTestStats = useMemo(() => {
    if (selectedCaseId !== 'case_clinical') return null;
    const cln = allDatasets.find((d) => d.id === 'df_clinical')!;
    const treat = cln.data.filter((r) => r.arm_group === 'Treatment').map((r) => Number(r.reduction_pct));
    const ctrl = cln.data.filter((r) => r.arm_group === 'Control').map((r) => Number(r.reduction_pct));
    return computeWelchTTest(treat, ctrl);
  }, [selectedCaseId]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCase.defaultRCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getCaseIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingBag':
        return <ShoppingBag className="w-4 h-4 text-amber-600" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4 text-indigo-600" />;
      case 'TrendingUp':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'Wind':
        return <Wind className="w-4 h-4 text-cyan-600" />;
      case 'HeartPulse':
        return <HeartPulse className="w-4 h-4 text-rose-600" />;
      case 'Truck':
        return <Truck className="w-4 h-4 text-purple-600" />;
      default:
        return <BarChart3 className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>模块 05</span>
            <span aria-hidden="true">·</span>
            <span>工业级实战应用</span>
            <span aria-hidden="true">·</span>
            <span>统计建模与业务场景闭环</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            六大 DataFrame 数据分析实战案例库
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            映射电子商务 RFM 聚类、制造业良率 ANOVA、量化金融缺失收益率清洗、智慧城市时空切片、临床试验 T-Test 对照及供应链多仓周转率审计。图表标题、图例与坐标轴全部采用标准英文。
          </p>
        </div>
      </div>

      {/* Case Tabs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {caseStudiesList.map((cs) => {
          const isSelected = selectedCaseId === cs.id;
          return (
            <button
              key={cs.id}
              onClick={() => setSelectedCaseId(cs.id)}
              className={`p-3 text-left border rounded-lg transition-colors flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`p-1.5 rounded ${isSelected ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  {getCaseIcon(cs.iconName)}
                </span>
                <span className="font-mono text-[10px] opacity-70 truncate">
                  {cs.domain.split('/')[0]}
                </span>
              </div>
              <div>
                <div className="text-xs font-bold leading-snug line-clamp-2">
                  {cs.title.split(' ')[1]}
                </div>
                <div className={`text-[10px] mt-1 truncate ${isSelected ? 'text-teal-300' : 'text-slate-500'}`}>
                  {cs.mapping.split('与')[0]}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Case Detail Workbench */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>{activeCase.domain}</span>
              <span aria-hidden="true">·</span>
              <span className="text-indigo-600 font-semibold">{activeCase.mapping}</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">{activeCase.title}</h2>
            <p className="text-xs text-slate-600 mt-1">{activeCase.description}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onNavigateToAIDiagnostics && (
              <button
                onClick={onNavigateToAIDiagnostics}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-300 rounded hover:bg-slate-50 text-slate-800 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>AI 诊断该案例</span>
              </button>
            )}
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors shadow-xs"
              title="复制代码，包含完整样例数据，可在项目外 RStudio 运行"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-teal-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? '已复制代码' : '复制代码'}</span>
            </button>
          </div>
        </div>

        {/* Case Visualization & Domain Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: ggplot2 Simulation Canvas with English Annotations */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>ggplot2 高保真图层渲染 (Simulation Plot)</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">theme_minimal()</span>
              </div>

              {/* Case 1: RFM Scatter Plot (English) */}
              {selectedCaseId === 'case_rfm' && (
                <div className="bg-slate-50 p-4 rounded border border-slate-200">
                  <div className="text-[11px] font-mono text-slate-500 mb-2">
                    geom_point(aes(x = recency_days, y = monetary_rmb, color = membership_tier))
                  </div>
                  <svg className="w-full h-56" viewBox="0 0 500 220">
                    <line x1="50" y1="20" x2="50" y2="180" stroke="#cbd5e1" strokeWidth="1" />
                    <line x1="50" y1="180" x2="480" y2="180" stroke="#cbd5e1" strokeWidth="1" />
                    <line x1="50" y1="100" x2="480" y2="100" stroke="#e2e8f0" strokeDasharray="3 3" />
                    <line x1="260" y1="20" x2="260" y2="180" stroke="#e2e8f0" strokeDasharray="3 3" />

                    {/* English Axes */}
                    <text x="50" y="14" fill="#475569" fontSize="10" fontFamily="monospace" fontWeight="600">
                      Monetary Value (RMB)
                    </text>
                    <text x="390" y="202" fill="#475569" fontSize="10" fontFamily="monospace" fontWeight="600">
                      Recency (Days) →
                    </text>
                    <text x="270" y="40" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
                      High-Value Core Segment
                    </text>

                    {activeDataset.data.map((r, i) => {
                      const cx = 60 + (Number(r.recency_days) / 220) * 400;
                      const cy = 175 - (Number(r.monetary_rmb) / 60000) * 150;
                      const color =
                        r.membership_tier === 'VIP'
                          ? '#0284c7'
                          : r.membership_tier === 'Gold'
                          ? '#d97706'
                          : r.membership_tier === 'Silver'
                          ? '#64748b'
                          : '#94a3b8';
                      return (
                        <circle
                          key={i}
                          cx={cx}
                          cy={cy}
                          r={r.membership_tier === 'VIP' ? 6 : 4}
                          fill={color}
                          fillOpacity="0.8"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        >
                          <title>{`${r.customer_id}: Monetary = ¥${r.monetary_rmb}, Recency = ${r.recency_days}d`}</title>
                        </circle>
                      );
                    })}
                  </svg>

                  {/* English Legend */}
                  <div className="flex items-center justify-between text-xs text-slate-600 mt-2 px-2 border-t border-slate-200/70 pt-2">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-slate-700">Membership Tier:</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span> VIP</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span> Gold</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span> Silver</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Standard</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Case 2: ANOVA Boxplot (English) */}
              {selectedCaseId === 'case_anova' && (
                <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-3">
                  <div className="text-[11px] font-mono text-slate-500">
                    geom_boxplot(aes(x = factory_id, y = yield_pct)) + stat_summary(fun = mean)
                  </div>
                  <svg className="w-full h-52" viewBox="0 0 500 200">
                    <line x1="50" y1="20" x2="50" y2="160" stroke="#cbd5e1" strokeWidth="1" />
                    <line x1="50" y1="160" x2="480" y2="160" stroke="#cbd5e1" strokeWidth="1" />

                    <text x="50" y="14" fill="#475569" fontSize="10" fontFamily="monospace" fontWeight="600">
                      Production Yield (%)
                    </text>
                    <text x="400" y="185" fill="#475569" fontSize="10" fontFamily="monospace" fontWeight="600">
                      Manufacturing Plant →
                    </text>

                    {[
                      { name: 'Plant_A', med: 98.2, q1: 98.0, q3: 98.5, min: 97.9, max: 98.8, color: '#3b82f6', outlier: null },
                      { name: 'Plant_B', med: 94.8, q1: 94.0, q3: 95.3, min: 93.9, max: 95.5, color: '#f59e0b', outlier: 88.5 },
                      { name: 'Plant_C', med: 99.2, q1: 99.0, q3: 99.3, min: 98.9, max: 99.4, color: '#10b981', outlier: null },
                      { name: 'Plant_D', med: 96.6, q1: 96.2, q3: 96.9, min: 95.8, max: 97.2, color: '#8b5cf6', outlier: null },
                    ].map((p, idx) => {
                      const cx = 100 + idx * 100;
                      const scaleY = (val: number) => 160 - ((val - 88) / 12) * 130;
                      const yQ1 = scaleY(p.q1);
                      const yQ3 = scaleY(p.q3);
                      const yMed = scaleY(p.med);
                      const yMin = scaleY(p.min);
                      const yMax = scaleY(p.max);

                      return (
                        <g key={p.name}>
                          <line x1={cx} y1={yMax} x2={cx} y2={yMin} stroke="#64748b" strokeWidth="1.5" />
                          <rect
                            x={cx - 24}
                            y={yQ3}
                            width="48"
                            height={yQ1 - yQ3}
                            fill={p.color}
                            fillOpacity="0.25"
                            stroke={p.color}
                            strokeWidth="1.5"
                          />
                          <line x1={cx - 24} y1={yMed} x2={cx + 24} y2={yMed} stroke="#0f172a" strokeWidth="2" />
                          {p.outlier && (
                            <circle cx={cx} cy={scaleY(p.outlier)} r="4" fill="#dc2626">
                              <title>Outlier Yield: {p.outlier}%</title>
                            </circle>
                          )}
                          <text x={cx} y="178" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#334155">
                            {p.name}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {anovaStats && (
                    <div className="p-2.5 bg-white rounded border border-slate-200 text-xs flex items-center justify-between font-mono">
                      <span>One-Way ANOVA F-Test:</span>
                      <span className="text-indigo-700 font-bold">F({anovaStats.dfBetween}, {anovaStats.dfWithin}) = {anovaStats.fStat}</span>
                      <span className="text-emerald-700 font-bold">P-value = {anovaStats.pVal} (Statistically Significant)</span>
                    </div>
                  )}
                </div>
              )}

              {/* Case 3: Financial Multi-Line Chart (English) */}
              {selectedCaseId === 'case_finance' && (
                <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
                  <div className="text-[11px] font-mono text-slate-500">
                    geom_line(aes(x = date, y = close_price, color = ticker)) + geom_point(na.rm = TRUE)
                  </div>
                  <div className="h-48 flex items-center justify-center border border-dashed border-slate-300 rounded bg-white text-xs text-slate-600">
                    <div className="text-center space-y-1">
                      <div className="font-semibold text-slate-800">
                        Multi-Asset Daily Returns & NA Forward Imputation
                      </div>
                      <p className="text-[11px] text-slate-500 max-w-md">
                        Trading dates aligned across Tech300, MedBio, and GreenEnergy. Weekend gaps successfully imputed via tidyr::fill(.direction = "down").
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Case 4: Air Quality Spatial Bar Chart (English) */}
              {selectedCaseId === 'case_airquality' && (
                <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
                  <div className="text-[11px] font-mono text-slate-500">
                    geom_col(aes(x = station_id, y = mean_pm25, fill = district_type))
                  </div>
                  <div className="space-y-2">
                    {[
                      { station: 'ST_Logistics (Logistics Hub)', pm: 83.0, aqi: 110, color: 'bg-rose-500' },
                      { station: 'ST_HiTech (High-Tech Zone)', pm: 76.1, aqi: 101, color: 'bg-amber-500' },
                      { station: 'ST_FinStreet (Financial District)', pm: 45.7, aqi: 64, color: 'bg-indigo-500' },
                      { station: 'ST_Olympic (Olympic Park)', pm: 20.1, aqi: 28, color: 'bg-emerald-500' },
                      { station: 'ST_Wetland (Wetland Eco-Zone)', pm: 16.9, aqi: 24, color: 'bg-teal-500' },
                    ].map((s) => (
                      <div key={s.station} className="text-xs space-y-0.5">
                        <div className="flex justify-between font-mono">
                          <span className="font-medium text-slate-800">{s.station}</span>
                          <span className="text-slate-500">{s.pm} ug/m3 (AQI: {s.aqi})</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded overflow-hidden">
                          <div className={`h-full ${s.color}`} style={{ width: `${(s.pm / 90) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Case 5: Clinical T-Test Plot (English) */}
              {selectedCaseId === 'case_clinical' && tTestStats && (
                <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-3">
                  <div className="text-[11px] font-mono text-slate-500">
                    stat_summary(fun.data = mean_cl_normal) + geom_errorbar()
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded border border-slate-200 text-center">
                      <div className="text-xs text-slate-500">Targeted Treatment Arm</div>
                      <div className="text-xl font-bold font-mono text-teal-700 mt-1">
                        +{tTestStats.meanA}%
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Mean Biomarker Reduction (N=8)</div>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 text-center">
                      <div className="text-xs text-slate-500">Placebo Control Arm</div>
                      <div className="text-xl font-bold font-mono text-slate-600 mt-1">
                        +{tTestStats.meanB}%
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Mean Biomarker Reduction (N=8)</div>
                    </div>
                  </div>
                  <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded text-xs text-indigo-950 font-mono">
                    Welch Two Sample t-test: t = {tTestStats.tStat}, df = {tTestStats.df}, p-value = {tTestStats.pVal}
                    <br />
                    95% Confidence Interval (95% CI): [{tTestStats.ci95[0]}%, {tTestStats.ci95[1]}%]
                  </div>
                </div>
              )}

              {/* Case 6: Warehouse Supply Chain (English) */}
              {selectedCaseId === 'case_warehouse' && (
                <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
                  <div className="text-[11px] font-mono text-slate-500">
                    geom_col(aes(x = sku_id, y = turnover_ratio, fill = stock_status))
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Physical inventory (df_inventory) inner joined with monthly shipments (df_shipments).
                    Identified <strong className="text-rose-600">SKU-807 Severe Shortage</strong> (15 units on hand vs 120 safety threshold)
                    and <strong className="text-amber-600">SKU-803 Overstock</strong> (1,200 units on hand, turnover = 0.27).
                  </p>
                </div>
              )}
            </div>

            {/* Reproducible R Script Block */}
            <div className="bg-slate-900 rounded-lg p-4 text-slate-100 font-mono text-xs overflow-x-auto space-y-2">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>现代 R 语言 tidyverse 实战脚本源码：</span>
                </span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white transition-colors"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? '已复制代码' : '复制代码'}</span>
                </button>
              </div>
              <pre className="leading-relaxed whitespace-pre-wrap">{activeCase.defaultRCode}</pre>
            </div>
          </div>

          {/* Right: Underlying Data Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="text-xs font-bold text-slate-900 mb-2">
                案例支撑数据集：{activeDataset.name}
              </div>
              <TableViewer df={activeDataset} maxRows={8} />
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 space-y-2">
              <div className="font-semibold text-slate-900">学术原理与业务洞察：</div>
              <p className="leading-relaxed">{activeCase.explanation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
