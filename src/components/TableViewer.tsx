import React, { useState } from 'react';
import { DataFrame } from '../types/dataframe';
import { ArrowUpDown, AlertCircle, Hash, Tag, Calendar, CheckSquare, Layers } from 'lucide-react';

interface TableViewerProps {
  df: DataFrame;
  maxRows?: number;
  highlightedRowIndices?: number[]; // 0-based
  highlightedCols?: string[];
  title?: string;
  subtitle?: string;
  showRowNumbers?: boolean;
}

export const TableViewer: React.FC<TableViewerProps> = ({
  df,
  maxRows = 10,
  highlightedRowIndices = [],
  highlightedCols = [],
  title,
  subtitle,
  showRowNumbers = true,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');

  const totalRows = df.data.length;
  const totalCols = df.columns.length;

  // Filter
  const filteredData = df.data.filter((row) => {
    if (!searchQuery) return true;
    return Object.values(row).some((val) =>
      String(val ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Sort
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortCol) return 0;
    const valA = a[sortCol];
    const valB = b[sortCol];
    if (valA === valB) return 0;
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / maxRows) || 1;
  const displayPage = Math.min(currentPage, totalPages);
  const startIndex = (displayPage - 1) * maxRows;
  const pageRows = sortedData.slice(startIndex, startIndex + maxRows);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'numeric':
      case 'integer':
        return <Hash className="w-3 h-3 text-slate-400" />;
      case 'factor':
        return <Layers className="w-3 h-3 text-indigo-400" />;
      case 'character':
        return <Tag className="w-3 h-3 text-emerald-400" />;
      case 'Date':
        return <Calendar className="w-3 h-3 text-amber-400" />;
      case 'logical':
        return <CheckSquare className="w-3 h-3 text-blue-400" />;
      default:
        return <Hash className="w-3 h-3 text-slate-400" />;
    }
  };

  const getTypeAbbr = (type: string) => {
    switch (type) {
      case 'numeric':
        return '<dbl>';
      case 'integer':
        return '<int>';
      case 'factor':
        return '<fct>';
      case 'character':
        return '<chr>';
      case 'Date':
        return '<date>';
      case 'logical':
        return '<lgl>';
      default:
        return '<var>';
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-lg overflow-hidden shadow-xs">
      {/* Header zone with clean unboxed metadata */}
      <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900 tracking-tight">
              {title || df.name}
            </span>
            {df.isGrouped && (
              <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded font-mono">
                [grouped_df: {df.groupByCols?.join(', ')}]
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>{subtitle || df.description || 'DataFrame 实体'}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{totalRows} 行</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{totalCols} 列</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="在表格中实时检索..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-slate-500 text-slate-800 placeholder-slate-400 w-44"
          />
        </div>
      </div>

      {/* High-density Data Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-600 select-none">
              {showRowNumbers && (
                <th className="py-2.5 px-3 w-12 text-center font-mono text-[11px] text-slate-400 border-r border-slate-200/70">
                  #
                </th>
              )}
              {df.columns.map((col) => {
                const isHighlighted = highlightedCols.includes(col.name);
                const isNumeric = col.type === 'numeric' || col.type === 'integer';
                return (
                  <th
                    key={col.name}
                    onClick={() => {
                      if (sortCol === col.name) {
                        setSortAsc(!sortAsc);
                      } else {
                        setSortCol(col.name);
                        setSortAsc(true);
                      }
                    }}
                    className={`py-2 px-3 font-medium cursor-pointer transition-colors hover:bg-slate-200/60 whitespace-nowrap ${
                      isHighlighted ? 'bg-indigo-50/80 text-indigo-900 border-b-2 border-indigo-500' : ''
                    } ${isNumeric ? 'text-right' : 'text-left'}`}
                  >
                    <div className={`flex items-center gap-1.5 ${isNumeric ? 'justify-end' : 'justify-start'}`}>
                      {getTypeIcon(col.type)}
                      <span className="font-semibold text-slate-800 font-mono">{col.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono tracking-tight">
                        {getTypeAbbr(col.type)}
                      </span>
                      <ArrowUpDown className="w-2.5 h-2.5 text-slate-400 opacity-60 ml-0.5" />
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={totalCols + 1} className="py-8 text-center text-slate-400">
                  暂无匹配的行记录 (Empty DataFrame)
                </td>
              </tr>
            ) : (
              pageRows.map((row, rIdx) => {
                const globalRowIdx = startIndex + rIdx;
                const isRowHighlighted = highlightedRowIndices.includes(globalRowIdx);

                return (
                  <tr
                    key={globalRowIdx}
                    className={`hover:bg-slate-50 transition-colors ${
                      isRowHighlighted ? 'bg-amber-50/70' : globalRowIdx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                    }`}
                  >
                    {showRowNumbers && (
                      <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-400 border-r border-slate-100">
                        {df.hasRowNames && df.rowNames?.[globalRowIdx] ? df.rowNames[globalRowIdx] : globalRowIdx + 1}
                      </td>
                    )}
                    {df.columns.map((col) => {
                      const val = row[col.name];
                      const isNumeric = col.type === 'numeric' || col.type === 'integer';
                      const isColHighlighted = highlightedCols.includes(col.name);
                      const isNA = val === null || val === undefined || Number.isNaN(val);

                      return (
                        <td
                          key={col.name}
                          className={`py-2 px-3 whitespace-nowrap font-mono tabular-nums ${
                            isNumeric ? 'text-right' : 'text-left'
                          } ${isColHighlighted ? 'bg-indigo-50/30 font-medium' : ''}`}
                        >
                          {isNA ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-rose-500 font-semibold bg-rose-50 px-1.5 py-0.2 rounded">
                              <AlertCircle className="w-2.5 h-2.5" />
                              NA
                            </span>
                          ) : typeof val === 'number' ? (
                            Number.isInteger(val) ? val.toLocaleString() : val.toFixed(2)
                          ) : typeof val === 'boolean' ? (
                            val ? 'TRUE' : 'FALSE'
                          ) : (
                            String(val)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span>
            显示 {sortedData.length > 0 ? startIndex + 1 : 0} -{' '}
            {Math.min(startIndex + maxRows, sortedData.length)} / 共{' '}
            <strong className="text-slate-800 font-mono">{sortedData.length}</strong> 条观测
          </span>
          {sortCol && (
            <span className="text-slate-400">
              (按 <code className="text-slate-700">{sortCol}</code> {sortAsc ? '升序' : '降序'})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={displayPage <= 1}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
          >
            上一页
          </button>
          <span className="font-mono px-1">
            {displayPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={displayPage >= totalPages}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
};
