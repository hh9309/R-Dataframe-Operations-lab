import React, { useState, useMemo } from 'react';
import { CASE_WORKFLOW_REPORTS, CaseWorkflowReport } from '../../data/caseReports';
import { TableViewer } from '../TableViewer';
import { DataFrame } from '../../types/dataframe';
import {
  Download,
  Copy,
  Check,
  FileText,
  Code2,
  Sparkles,
  FileDown,
  CheckCircle2,
  Eye,
  Database,
  Layers,
  BarChart3,
  Activity,
  ArrowRight,
  ShieldCheck,
  Table as TableIcon,
  ChevronRight,
  FolderGit2,
} from 'lucide-react';

export const Module9Export: React.FC = () => {
  const [activeCaseIndex, setActiveCaseIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'preview' | 'rmarkdown' | 'html' | 'markdown'>('preview');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const activeCase = CASE_WORKFLOW_REPORTS[activeCaseIndex];
  const activeDataset = activeCase.dataset;

  // Helper to convert dataframe to CSV string
  const getCsvString = (df: DataFrame): string => {
    const headers = df.columns.map((c) => c.name).join(',');
    const rows = df.data.map((row) =>
      df.columns
        .map((c) => {
          const val = row[c.name];
          if (val === null || val === undefined) return 'NA';
          if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
          return String(val);
        })
        .join(',')
    );
    return [headers, ...rows].join('\n');
  };

  // Helper to convert dataframe to JSON string
  const getJsonString = (df: DataFrame): string => {
    return JSON.stringify(df.data, null, 2);
  };

  // Download raw dataset in CSV
  const handleDownloadRawCSV = () => {
    const csv = getCsvString(activeDataset);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeDataset.id}_raw_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download raw dataset in JSON
  const handleDownloadRawJSON = () => {
    const json = getJsonString(activeDataset);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeDataset.id}_raw_data.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy raw dataset CSV
  const handleCopyRawCSV = () => {
    const csv = getCsvString(activeDataset);
    navigator.clipboard.writeText(csv);
    setCopiedText('raw_csv');
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Generate full 6-part R Markdown document
  const rMarkdownDocument = useMemo(() => {
    const sectionsText = activeCase.sections
      .map((sec) => {
        let text = `## ${sec.partTitle}\n\n${sec.content}\n\n`;
        if (sec.metrics && sec.metrics.length > 0) {
          text += `| 指标维度 | 量化结果 |\n| :--- | :--- |\n`;
          sec.metrics.forEach((m) => {
            text += `| ${m.label} | ${m.value} |\n`;
          });
          text += `\n`;
        }
        if (sec.rCodeSnippet) {
          text += `\`\`\`{r}\n${sec.rCodeSnippet}\n\`\`\`\n\n`;
        }
        return text;
      })
      .join('\n');

    return `---
title: "${activeCase.title} - 数据科学全流程分析报告"
author: "R tidyverse 数据科学实验室"
date: "\`r Sys.Date()\`"
output:
  html_document:
    theme: readable
    toc: true
    toc_depth: 3
    toc_float: true
    number_sections: true
    code_folding: show
---

\`\`\`{r setup, include=FALSE}
knitr::opts_chunk$set(echo = TRUE, warning = FALSE, message = FALSE)
library(dplyr)
library(tidyr)
library(ggplot2)
library(tibble)
\`\`\`

# 摘要与研究范式

本报告按照数据科学全流程导引标准分为六大部分，完整涵盖业务问题定义、原始数据架构整洁度审计、交互式索引切片清洗、分组聚合统计推导、ggplot2 可视化推断以及智能随诊部署复盘。

${sectionsText}

## 附录：ggplot2 高清图表代码 (可直接在外部 RStudio 中运行)

\`\`\`{r ggplot_chart, fig.width=9, fig.height=5}
# Standalone ggplot2 code snippet
${activeCase.ggplotCode}
\`\`\`
`;
  }, [activeCase]);

  // Generate full 6-part Markdown document
  const markdownDocument = useMemo(() => {
    const sectionsText = activeCase.sections
      .map((sec) => {
        let text = `### ${sec.partTitle}\n\n${sec.content}\n\n`;
        if (sec.metrics && sec.metrics.length > 0) {
          text += `| 指标维度 | 量化结果 |\n| :--- | :--- |\n`;
          sec.metrics.forEach((m) => {
            text += `| ${m.label} | ${m.value} |\n`;
          });
          text += `\n`;
        }
        if (sec.rCodeSnippet) {
          text += `\`\`\`r\n${sec.rCodeSnippet}\n\`\`\`\n\n`;
        }
        return text;
      })
      .join('\n');

    return `# ${activeCase.title} - 数据科学全流程分析报告

> 领域：${activeCase.domain} | 报告架构：全流程导引 6 大核心阶段 | 数据源：${activeCase.dataset.name}

---

${sectionsText}

### 附录：ggplot2 可视化脚本
\`\`\`r
${activeCase.ggplotCode}
\`\`\`
`;
  }, [activeCase]);

  // Generate HTML standalone document
  const htmlDocument = useMemo(() => {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>${activeCase.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.65; max-width: 960px; margin: 40px auto; padding: 0 24px; color: #1e293b; background: #f8fafc; }
    h1 { font-size: 24px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
    h2 { font-size: 18px; color: #0f172a; margin-top: 28px; border-left: 4px solid #0284c7; padding-left: 10px; }
    pre { background: #0f172a; color: #f8fafc; padding: 14px 18px; border-radius: 8px; overflow-x: auto; font-size: 13px; font-family: monospace; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; background: white; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    th, td { border: 1px solid #cbd5e1; padding: 10px 14px; font-size: 13px; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; color: #334155; }
    .badge { display: inline-block; padding: 2px 8px; background: #e0f2fe; color: #0369a1; border-radius: 4px; font-size: 11px; font-weight: bold; margin-bottom: 8px; }
    .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin: 14px 0; }
    .metric-card { background: white; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; }
    .metric-label { font-size: 11px; color: #64748b; }
    .metric-val { font-size: 15px; font-weight: bold; color: #0f172a; margin-top: 4px; }
  </style>
</head>
<body>
  <h1>${activeCase.title}</h1>
  <p><strong>研究领域:</strong> ${activeCase.domain} | <strong>执行标准:</strong> Tidyverse 全流程 6 大阶段规范 | <strong>导出日期:</strong> 2026-10-26</p>

  ${activeCase.sections
    .map(
      (sec) => `
    <h2>${sec.partTitle}</h2>
    <div class="badge">${sec.badge}</div>
    <p>${sec.content}</p>
    ${
      sec.metrics && sec.metrics.length > 0
        ? `
      <div class="metric-grid">
        ${sec.metrics
          .map(
            (m) => `
          <div class="metric-card">
            <div class="metric-label">${m.label}</div>
            <div class="metric-val">${m.value}</div>
          </div>
        `
          )
          .join('')}
      </div>
    `
        : ''
    }
    ${sec.rCodeSnippet ? `<pre><code>${sec.rCodeSnippet}</code></pre>` : ''}
  `
    )
    .join('')}

  <h2>附录：ggplot2 绘图脚本</h2>
  <pre><code>${activeCase.ggplotCode}</code></pre>
</body>
</html>`;
  }, [activeCase]);

  // Handle Download Report file
  const handleDownloadReport = () => {
    const configs: Record<string, { ext: string; mime: string; content: string }> = {
      preview: { ext: 'Rmd', mime: 'text/plain;charset=utf-8;', content: rMarkdownDocument },
      rmarkdown: { ext: 'Rmd', mime: 'text/plain;charset=utf-8;', content: rMarkdownDocument },
      html: { ext: 'html', mime: 'text/html;charset=utf-8;', content: htmlDocument },
      markdown: { ext: 'md', mime: 'text/markdown;charset=utf-8;', content: markdownDocument },
    };

    const target = configs[viewMode] || configs.rmarkdown;
    const blob = new Blob([target.content], { type: target.mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeCase.caseId}_report.${target.ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle Copy Report Code
  const handleCopyReport = () => {
    const textToCopy =
      viewMode === 'html'
        ? htmlDocument
        : viewMode === 'markdown'
        ? markdownDocument
        : rMarkdownDocument;

    navigator.clipboard.writeText(textToCopy);
    setCopiedText('report');
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>模块 09</span>
              <span aria-hidden="true">·</span>
              <span>成果交付与报告导出切片</span>
              <span aria-hidden="true">·</span>
              <span>全流程 6 大阶段规范报告 · 原始数据即刻下载</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              数据集与分析报告导出引擎
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              为六大实战案例提供原始数据（CSV / JSON）直接下载选项；所有分析报告严格按照全流程导引的六大核心步骤组织，并提供高保真实时预览、源码导出与一键复制代码。
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-300 rounded hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
            >
              {copiedText === 'report' ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText === 'report' ? '已复制代码' : '复制代码'}</span>
            </button>

            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-teal-300" />
              <span>下载报告 (.{viewMode === 'preview' ? 'Rmd' : viewMode === 'rmarkdown' ? 'Rmd' : viewMode})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Case Studies Selector Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900">
          <span className="flex items-center gap-1.5">
            <FolderGit2 className="w-4 h-4 text-slate-600" />
            <span>选择案例切片 (共 6 大经典业务实战场景)：</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">点击切换案例查看对应原始数据与全流程报告</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {CASE_WORKFLOW_REPORTS.map((c, idx) => {
            const isSelected = activeCaseIndex === idx;
            return (
              <button
                key={c.caseId}
                onClick={() => {
                  setActiveCaseIndex(idx);
                }}
                className={`text-left p-3 rounded-lg border transition-all relative ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono opacity-70 mb-1">
                  <span>案例 0{idx + 1}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-teal-300"></span>}
                </div>
                <div className="text-xs font-bold truncate">{c.title.split('：')[1] || c.title}</div>
                <div className={`text-[10px] mt-1 truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {c.domain}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Raw Data Download Panel */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200/60 flex items-center justify-center">
              <Database className="w-4 h-4 text-teal-700" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span>案例原始数据：{activeDataset.name}</span>
                <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                  {activeDataset.data.length} 行 × {activeDataset.columns.length} 列
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">{activeDataset.description}</p>
            </div>
          </div>

          {/* Raw Data Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyRawCSV}
              className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium flex items-center gap-1 transition-colors"
              title="复制原始 CSV 文本"
            >
              {copiedText === 'raw_csv' ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText === 'raw_csv' ? '已复制 CSV' : '复制原始数据 (CSV)'}</span>
            </button>

            <button
              onClick={handleDownloadRawCSV}
              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载原始数据 (CSV)</span>
            </button>

            <button
              onClick={handleDownloadRawJSON}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-500" />
              <span>下载 (JSON)</span>
            </button>
          </div>
        </div>

        {/* Quick Raw Data Preview Strip */}
        <div>
          <div className="text-[11px] text-slate-500 mb-1.5 flex items-center justify-between">
            <span className="font-semibold text-slate-700">原始数据结构与前 4 行切片预览：</span>
            <span className="font-mono text-[10px]">字段: {activeDataset.columns.map((c) => c.name).join(', ')}</span>
          </div>
          <TableViewer df={activeDataset} maxRows={4} />
        </div>
      </div>

      {/* Report View Tabs: Preview vs Source Code */}
      <div className="bg-white border border-slate-200/90 rounded-lg overflow-hidden shadow-xs">
        <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800 mr-2">报告视图切换：</span>

            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                viewMode === 'preview'
                  ? 'bg-slate-900 text-white shadow-xs font-semibold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-teal-300" />
              <span>报告实时预览 (全流程 6 大部分)</span>
            </button>

            <button
              onClick={() => setViewMode('rmarkdown')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                viewMode === 'rmarkdown'
                  ? 'bg-slate-900 text-white shadow-xs font-semibold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>R Markdown 源码 (.Rmd)</span>
            </button>

            <button
              onClick={() => setViewMode('html')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                viewMode === 'html'
                  ? 'bg-slate-900 text-white shadow-xs font-semibold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-amber-400" />
              <span>HTML 网页报告源码</span>
            </button>

            <button
              onClick={() => setViewMode('markdown')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                viewMode === 'markdown'
                  ? 'bg-slate-900 text-white shadow-xs font-semibold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>标准 Markdown (.md)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">
              {activeCase.sections.length} 个结构化报告部分
            </span>
          </div>
        </div>

        {/* View Mode 1: High-Fidelity Interactive Report Preview */}
        {viewMode === 'preview' && (
          <div className="p-6 space-y-6 max-h-[850px] overflow-y-auto">
            {/* Report Header Card */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-xs text-teal-300 font-mono">
                <span>{activeCase.domain}</span>
                <span>·</span>
                <span>符合全流程导引规范 (最少 6 个部分)</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">{activeCase.title}</h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2 border-t border-slate-700/60 font-mono">
                <span>样本量: {activeDataset.data.length} 行</span>
                <span>维度: {activeDataset.columns.length} 变量</span>
                <span>规范: Tidy Data & Hadley Wickham 标准</span>
                <span>导出格式: HTML / Rmd / Markdown</span>
              </div>
            </div>

            {/* Render All 6 Sections */}
            <div className="space-y-5">
              {activeCase.sections.map((sec) => (
                <div
                  key={sec.stepNumber}
                  className="bg-white border border-slate-200/90 rounded-lg p-5 space-y-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-mono flex items-center justify-center shrink-0">
                        0{sec.stepNumber}
                      </span>
                      <span>{sec.partTitle}</span>
                    </h3>
                    <span className="text-[11px] font-mono font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded self-start sm:self-auto">
                      {sec.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{sec.content}</p>

                  {/* Metric KPI cards */}
                  {sec.metrics && sec.metrics.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                      {sec.metrics.map((m, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200/70 rounded-md">
                          <div className="text-[11px] text-slate-500">{m.label}</div>
                          <div className="text-xs font-bold text-slate-900 mt-0.5 font-mono">{m.value}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Code snippet if any */}
                  {sec.rCodeSnippet && (
                    <div className="mt-2 bg-slate-950 text-slate-100 p-3 rounded-md font-mono text-xs overflow-x-auto border border-slate-800">
                      <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-between font-sans">
                        <span>R 语言处理管道片段：</span>
                        <span>可直接复制</span>
                      </div>
                      <pre className="text-[11px] leading-relaxed">
                        <code>{sec.rCodeSnippet}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ggplot2 Visualized Plot Preview in English */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    ggplot2 图表输出预览 (严格使用标准英文标签与坐标轴)
                  </h4>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Title: "{activeCase.chartInfo.title}"
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                  theme_minimal()
                </span>
              </div>

              {/* Graphical Preview Card */}
              <div className="bg-white p-4 rounded border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 font-mono">{activeCase.chartInfo.title}</span>
                  <span className="text-[11px] text-slate-400 font-mono">{activeCase.chartInfo.subtitle}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded">
                  <div><strong>X-Axis:</strong> {activeCase.chartInfo.xAxis}</div>
                  <div><strong>Y-Axis:</strong> {activeCase.chartInfo.yAxis}</div>
                  <div><strong>Legend:</strong> {activeCase.chartInfo.legend}</div>
                </div>
              </div>

              {/* Standalone R Code */}
              <div className="bg-slate-950 p-3 rounded text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
                <div className="text-[10px] text-slate-400 mb-1 font-sans">完整绘图源码 (包含英文标示)：</div>
                <pre className="text-[11px] leading-relaxed">
                  <code>{activeCase.ggplotCode}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* View Mode 2: R Markdown (.Rmd) */}
        {viewMode === 'rmarkdown' && (
          <div className="p-4 bg-slate-950 text-slate-100 font-mono text-xs max-h-[750px] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
              <span>{activeCase.caseId}_report.Rmd (R Markdown Source)</span>
              <button
                onClick={handleCopyReport}
                className="text-teal-400 hover:text-teal-300 flex items-center gap-1 font-sans"
              >
                {copiedText === 'report' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText === 'report' ? '已复制代码' : '复制代码'}</span>
              </button>
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed">
              <code>{rMarkdownDocument}</code>
            </pre>
          </div>
        )}

        {/* View Mode 3: HTML Source */}
        {viewMode === 'html' && (
          <div className="p-4 bg-slate-950 text-slate-100 font-mono text-xs max-h-[750px] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
              <span>{activeCase.caseId}_report.html (Standalone HTML Document)</span>
              <button
                onClick={handleCopyReport}
                className="text-teal-400 hover:text-teal-300 flex items-center gap-1 font-sans"
              >
                {copiedText === 'report' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText === 'report' ? '已复制代码' : '复制代码'}</span>
              </button>
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed">
              <code>{htmlDocument}</code>
            </pre>
          </div>
        )}

        {/* View Mode 4: Markdown (.md) */}
        {viewMode === 'markdown' && (
          <div className="p-4 bg-slate-950 text-slate-100 font-mono text-xs max-h-[750px] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
              <span>{activeCase.caseId}_report.md (Clean Markdown)</span>
              <button
                onClick={handleCopyReport}
                className="text-teal-400 hover:text-teal-300 flex items-center gap-1 font-sans"
              >
                {copiedText === 'report' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText === 'report' ? '已复制代码' : '复制代码'}</span>
              </button>
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed">
              <code>{markdownDocument}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
