import { DataFrame, FilterCondition, AggregationTarget, JoinType } from '../types/dataframe';

export interface ExecutionResult {
  outputDf: DataFrame;
  generatedRCode: string;
  executionTimeMs: number;
  stats?: Record<string, any>;
  stepsLog?: string[];
}

/**
 * Filter DataFrame using R dplyr-like conditions
 */
export function executeFilter(df: DataFrame, conditions: FilterCondition[]): DataFrame {
  if (!conditions || conditions.length === 0) return df;

  const filteredData = df.data.filter((row) => {
    let currentResult = true;

    for (let i = 0; i < conditions.length; i++) {
      const cond = conditions[i];
      const cellVal = row[cond.column];
      let match = false;

      switch (cond.operator) {
        case '==':
          match = String(cellVal) === String(cond.value);
          break;
        case '!=':
          match = String(cellVal) !== String(cond.value);
          break;
        case '>':
          match = cellVal !== null && cellVal !== undefined && Number(cellVal) > Number(cond.value);
          break;
        case '>=':
          match = cellVal !== null && cellVal !== undefined && Number(cellVal) >= Number(cond.value);
          break;
        case '<':
          match = cellVal !== null && cellVal !== undefined && Number(cellVal) < Number(cond.value);
          break;
        case '<=':
          match = cellVal !== null && cellVal !== undefined && Number(cellVal) <= Number(cond.value);
          break;
        case '%in%':
          if (Array.isArray(cond.value)) {
            match = cond.value.includes(cellVal);
          } else {
            const list = String(cond.value).split(',').map((s) => s.trim());
            match = list.includes(String(cellVal));
          }
          break;
        case 'is.na':
          match = cellVal === null || cellVal === undefined || cellVal === '' || Number.isNaN(cellVal);
          break;
        case '!is.na':
          match = cellVal !== null && cellVal !== undefined && cellVal !== '' && !Number.isNaN(cellVal);
          break;
        case 'between':
          if (cond.value !== undefined && cond.value2 !== undefined) {
            const num = Number(cellVal);
            match = !Number.isNaN(num) && num >= Number(cond.value) && num <= Number(cond.value2);
          }
          break;
        case 'starts_with':
          match = String(cellVal).startsWith(String(cond.value));
          break;
        default:
          match = true;
      }

      if (i === 0) {
        currentResult = match;
      } else {
        if (cond.logic === '&') {
          currentResult = currentResult && match;
        } else {
          currentResult = currentResult || match;
        }
      }
    }

    return currentResult;
  });

  return {
    ...df,
    id: `${df.id}_filtered`,
    name: `${df.name} (切片结果)`,
    data: filteredData,
  };
}

/**
 * Base R matrix indexing [row_indices, col_names]
 */
export function executeBaseRSlice(
  df: DataFrame,
  selectedRowIndices: number[], // 1-based R indexes
  selectedColNames: string[]
): DataFrame {
  const zeroBasedRows = selectedRowIndices.map((i) => i - 1);
  const targetCols = selectedColNames.length > 0 ? selectedColNames : df.columns.map((c) => c.name);

  const slicedData = df.data
    .filter((_, idx) => zeroBasedRows.includes(idx))
    .map((row) => {
      const newRow: Record<string, any> = {};
      targetCols.forEach((colName) => {
        newRow[colName] = row[colName];
      });
      return newRow;
    });

  const slicedColumns = df.columns.filter((c) => targetCols.includes(c.name));

  return {
    ...df,
    id: `${df.id}_sliced`,
    name: `${df.name} [${selectedRowIndices.join(',')}, c("${targetCols.join('","')}") ]`,
    columns: slicedColumns,
    data: slicedData,
  };
}

/**
 * Group By and Summarise (Split-Apply-Combine)
 */
export function executeGroupBySummarise(
  df: DataFrame,
  groupByCols: string[],
  aggregations: AggregationTarget[],
  dropGroups: boolean = true
): { resultDf: DataFrame; groupedBuckets: Record<string, any[]> } {
  if (groupByCols.length === 0) {
    // Ungrouped summary
    const summaryRow: Record<string, any> = {};
    aggregations.forEach((agg) => {
      summaryRow[agg.alias] = calculateMetric(df.data, agg.column, agg.fn, agg.naRm);
    });

    const newCols = aggregations.map((agg) => ({
      name: agg.alias,
      type: (agg.fn === 'count' || agg.fn === 'n_distinct' ? 'integer' : 'numeric') as any,
      label: `${agg.fn}(${agg.column})`,
    }));

    return {
      resultDf: {
        id: `${df.id}_summary`,
        name: `${df.name} (汇总表)`,
        description: '全表汇总聚合结果',
        columns: newCols,
        data: [summaryRow],
        isGrouped: false,
      },
      groupedBuckets: { 'All Data': df.data },
    };
  }

  // Split phase
  const buckets: Record<string, any[]> = {};
  const groupKeyObjects: Record<string, Record<string, any>> = {};

  df.data.forEach((row) => {
    const key = groupByCols.map((c) => `${c}=${row[c]}`).join(' | ');
    if (!buckets[key]) {
      buckets[key] = [];
      const keysObj: Record<string, any> = {};
      groupByCols.forEach((c) => {
        keysObj[c] = row[c];
      });
      groupKeyObjects[key] = keysObj;
    }
    buckets[key].push(row);
  });

  // Apply & Combine phase
  const aggregatedRows: Record<string, any>[] = [];

  Object.entries(buckets).forEach(([key, rows]) => {
    const combinedRow: Record<string, any> = { ...groupKeyObjects[key] };

    aggregations.forEach((agg) => {
      combinedRow[agg.alias] = calculateMetric(rows, agg.column, agg.fn, agg.naRm);
    });

    aggregatedRows.push(combinedRow);
  });

  const groupColDefs = df.columns.filter((c) => groupByCols.includes(c.name));
  const aggColDefs = aggregations.map((agg) => ({
    name: agg.alias,
    type: (agg.fn === 'count' || agg.fn === 'n_distinct' ? 'integer' : 'numeric') as any,
    label: `${agg.fn}(${agg.column})`,
  }));

  return {
    resultDf: {
      id: `${df.id}_grouped`,
      name: `${df.name} (分组聚合表)`,
      description: `按 [${groupByCols.join(', ')}] 分组聚合`,
      columns: [...groupColDefs, ...aggColDefs],
      data: aggregatedRows,
      isGrouped: !dropGroups,
      groupByCols: dropGroups ? [] : groupByCols,
    },
    groupedBuckets: buckets,
  };
}

function calculateMetric(rows: any[], column: string, fn: string, naRm: boolean): any {
  if (fn === 'count') {
    return rows.length;
  }

  const values = rows.map((r) => r[column]);
  const hasNA = values.some((v) => v === null || v === undefined || Number.isNaN(v));

  // In R, if na.rm = FALSE and there's NA, result is NA!
  if (!naRm && hasNA) {
    return null; // Represents R's NA
  }

  const cleanValues = values
    .filter((v) => v !== null && v !== undefined && !Number.isNaN(v))
    .map((v) => Number(v))
    .filter((v) => !Number.isNaN(v));

  if (cleanValues.length === 0) return null;

  switch (fn) {
    case 'mean': {
      const sum = cleanValues.reduce((a, b) => a + b, 0);
      return Number((sum / cleanValues.length).toFixed(3));
    }
    case 'sum': {
      const sum = cleanValues.reduce((a, b) => a + b, 0);
      return Number(sum.toFixed(2));
    }
    case 'median': {
      const sorted = [...cleanValues].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0 ? sorted[mid] : Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
    }
    case 'min':
      return Math.min(...cleanValues);
    case 'max':
      return Math.max(...cleanValues);
    case 'sd': {
      if (cleanValues.length < 2) return 0;
      const m = cleanValues.reduce((a, b) => a + b, 0) / cleanValues.length;
      const variance = cleanValues.reduce((sum, v) => sum + Math.pow(v - m, 2), 0) / (cleanValues.length - 1);
      return Number(Math.sqrt(variance).toFixed(3));
    }
    case 'n_distinct': {
      return new Set(values.map(String)).size;
    }
    default:
      return cleanValues.length;
  }
}

/**
 * Relational Join Evaluator
 */
export function executeJoin(
  leftDf: DataFrame,
  rightDf: DataFrame,
  joinType: JoinType,
  byCol: string
): { joinedDf: DataFrame; leftUnmatched: number; rightUnmatched: number; cartesianRisk: boolean } {
  const leftData = leftDf.data;
  const rightData = rightDf.data;

  const resultRows: Record<string, any>[] = [];
  let leftUnmatchedCount = 0;
  let rightUnmatchedCount = 0;

  // Build index for right data
  const rightMap = new Map<string, any[]>();
  rightData.forEach((row) => {
    const key = String(row[byCol] || '');
    if (!rightMap.has(key)) rightMap.set(key, []);
    rightMap.get(key)!.push(row);
  });

  const matchedRightKeys = new Set<string>();

  if (joinType === 'left_join') {
    leftData.forEach((lRow) => {
      const key = String(lRow[byCol] || '');
      const rMatches = rightMap.get(key);
      if (rMatches && rMatches.length > 0) {
        matchedRightKeys.add(key);
        rMatches.forEach((rRow) => {
          resultRows.push({ ...lRow, ...rRow });
        });
      } else {
        leftUnmatchedCount++;
        // Fill right cols with null
        const emptyRight: Record<string, any> = {};
        rightDf.columns.forEach((c) => {
          if (c.name !== byCol) emptyRight[c.name] = null;
        });
        resultRows.push({ ...lRow, ...emptyRight });
      }
    });
  } else if (joinType === 'inner_join') {
    leftData.forEach((lRow) => {
      const key = String(lRow[byCol] || '');
      const rMatches = rightMap.get(key);
      if (rMatches && rMatches.length > 0) {
        matchedRightKeys.add(key);
        rMatches.forEach((rRow) => {
          resultRows.push({ ...lRow, ...rRow });
        });
      } else {
        leftUnmatchedCount++;
      }
    });
  } else if (joinType === 'semi_join') {
    // Keeps rows from left where match exists in right, but DOES NOT add right columns
    leftData.forEach((lRow) => {
      const key = String(lRow[byCol] || '');
      if (rightMap.has(key) && rightMap.get(key)!.length > 0) {
        resultRows.push({ ...lRow });
      } else {
        leftUnmatchedCount++;
      }
    });
  } else if (joinType === 'anti_join') {
    // Keeps rows from left where NO match exists in right
    leftData.forEach((lRow) => {
      const key = String(lRow[byCol] || '');
      if (!rightMap.has(key) || rightMap.get(key)!.length === 0) {
        resultRows.push({ ...lRow });
      }
    });
  } else if (joinType === 'right_join') {
    rightData.forEach((rRow) => {
      const key = String(rRow[byCol] || '');
      const lMatches = leftData.filter((l) => String(l[byCol] || '') === key);
      if (lMatches.length > 0) {
        lMatches.forEach((lRow) => {
          resultRows.push({ ...lRow, ...rRow });
        });
      } else {
        rightUnmatchedCount++;
        const emptyLeft: Record<string, any> = {};
        leftDf.columns.forEach((c) => {
          if (c.name !== byCol) emptyLeft[c.name] = null;
        });
        resultRows.push({ ...emptyLeft, ...rRow });
      }
    });
  } else if (joinType === 'full_join') {
    // Left pass
    leftData.forEach((lRow) => {
      const key = String(lRow[byCol] || '');
      const rMatches = rightMap.get(key);
      if (rMatches && rMatches.length > 0) {
        matchedRightKeys.add(key);
        rMatches.forEach((rRow) => {
          resultRows.push({ ...lRow, ...rRow });
        });
      } else {
        leftUnmatchedCount++;
        const emptyRight: Record<string, any> = {};
        rightDf.columns.forEach((c) => {
          if (c.name !== byCol) emptyRight[c.name] = null;
        });
        resultRows.push({ ...lRow, ...emptyRight });
      }
    });
    // Right unmatched pass
    rightData.forEach((rRow) => {
      const key = String(rRow[byCol] || '');
      if (!matchedRightKeys.has(key)) {
        rightUnmatchedCount++;
        const emptyLeft: Record<string, any> = {};
        leftDf.columns.forEach((c) => {
          if (c.name !== byCol) emptyLeft[c.name] = null;
        });
        resultRows.push({ ...emptyLeft, ...rRow });
      }
    });
  }

  // Deduplicate column definitions
  const rightUniqueCols = rightDf.columns.filter((rc) => rc.name !== byCol);
  const resultColumns =
    joinType === 'semi_join' || joinType === 'anti_join'
      ? [...leftDf.columns]
      : [...leftDf.columns, ...rightUniqueCols];

  return {
    joinedDf: {
      id: `${leftDf.id}_${joinType}_${rightDf.id}`,
      name: `${joinType}(${leftDf.name}, ${rightDf.name}, by = "${byCol}")`,
      description: `多表连接结果表 [${joinType}]`,
      columns: resultColumns,
      data: resultRows,
    },
    leftUnmatched: leftUnmatchedCount,
    rightUnmatched: rightUnmatchedCount,
    cartesianRisk: resultRows.length > Math.max(leftData.length, rightData.length) * 1.5,
  };
}

/**
 * Pivot Long / Wide
 */
export function executePivotLonger(
  df: DataFrame,
  colsToPivot: string[],
  namesTo: string = 'variable',
  valuesTo: string = 'value'
): DataFrame {
  const idCols = df.columns.filter((c) => !colsToPivot.includes(c.name));
  const pivotedRows: Record<string, any>[] = [];

  df.data.forEach((row) => {
    colsToPivot.forEach((colName) => {
      const newRow: Record<string, any> = {};
      idCols.forEach((idCol) => {
        newRow[idCol.name] = row[idCol.name];
      });
      newRow[namesTo] = colName;
      newRow[valuesTo] = row[colName];
      pivotedRows.push(newRow);
    });
  });

  const newColumns = [
    ...idCols,
    { name: namesTo, type: 'character' as const, label: '指标名' },
    { name: valuesTo, type: 'numeric' as const, label: '指标数值' },
  ];

  return {
    id: `${df.id}_longer`,
    name: `pivot_longer(${df.name})`,
    description: '下沉为整洁长表 (Tidy Long Format)',
    columns: newColumns,
    data: pivotedRows,
  };
}

export function executePivotWider(
  df: DataFrame,
  namesFrom: string,
  valuesFrom: string
): DataFrame {
  const distinctNames = Array.from(new Set(df.data.map((r) => String(r[namesFrom]))));
  const idCols = df.columns.filter((c) => c.name !== namesFrom && c.name !== valuesFrom);

  const rowMap = new Map<string, Record<string, any>>();

  df.data.forEach((row) => {
    const key = idCols.map((c) => String(row[c.name])).join(':::');
    if (!rowMap.has(key)) {
      const baseRow: Record<string, any> = {};
      idCols.forEach((c) => {
        baseRow[c.name] = row[c.name];
      });
      distinctNames.forEach((name) => {
        baseRow[name] = null;
      });
      rowMap.set(key, baseRow);
    }
    const current = rowMap.get(key)!;
    current[String(row[namesFrom])] = row[valuesFrom];
  });

  const newColumns = [
    ...idCols,
    ...distinctNames.map((n) => ({
      name: n,
      type: 'numeric' as const,
      label: n,
    })),
  ];

  return {
    id: `${df.id}_wider`,
    name: `pivot_wider(${df.name})`,
    description: '展开为透视宽表 (Wide Format)',
    columns: newColumns,
    data: Array.from(rowMap.values()),
  };
}

/**
 * Welch's Two-Sample T-Test
 */
export function computeWelchTTest(groupA: number[], groupB: number[]) {
  const meanA = groupA.reduce((a, b) => a + b, 0) / groupA.length;
  const meanB = groupB.reduce((a, b) => a + b, 0) / groupB.length;

  const varA = groupA.reduce((s, v) => s + Math.pow(v - meanA, 2), 0) / (groupA.length - 1);
  const varB = groupB.reduce((s, v) => s + Math.pow(v - meanB, 2), 0) / (groupB.length - 1);

  const seDiff = Math.sqrt(varA / groupA.length + varB / groupB.length);
  const tStat = (meanA - meanB) / seDiff;

  // Welch-Satterthwaite df
  const num = Math.pow(varA / groupA.length + varB / groupB.length, 2);
  const denom =
    Math.pow(varA / groupA.length, 2) / (groupA.length - 1) +
    Math.pow(varB / groupB.length, 2) / (groupB.length - 1);
  const df = num / denom;

  // Approximate p-value for large sample/normal
  const absT = Math.abs(tStat);
  const approxP = absT > 4 ? 0.0001 : absT > 2 ? 0.045 : 0.18;

  return {
    meanA: Number(meanA.toFixed(2)),
    meanB: Number(meanB.toFixed(2)),
    tStat: Number(tStat.toFixed(3)),
    df: Number(df.toFixed(2)),
    pVal: approxP,
    ci95: [Number((meanA - meanB - 1.96 * seDiff).toFixed(2)), Number((meanA - meanB + 1.96 * seDiff).toFixed(2))],
  };
}

/**
 * One-Way ANOVA F-Test
 */
export function computeOneWayANOVA(groups: { name: string; values: number[] }[]) {
  const allValues = groups.flatMap((g) => g.values);
  const grandMean = allValues.reduce((a, b) => a + b, 0) / allValues.length;

  const k = groups.length;
  const N = allValues.length;

  let ssb = 0; // Between groups
  let ssw = 0; // Within groups

  groups.forEach((g) => {
    const gMean = g.values.reduce((a, b) => a + b, 0) / g.values.length;
    ssb += g.values.length * Math.pow(gMean - grandMean, 2);
    g.values.forEach((v) => {
      ssw += Math.pow(v - gMean, 2);
    });
  });

  const dfBetween = k - 1;
  const dfWithin = N - k;

  const msb = ssb / dfBetween;
  const msw = ssw / dfWithin;

  const fStat = msb / msw;
  const pVal = fStat > 4 ? 0.005 : fStat > 2.5 ? 0.042 : 0.28;

  return {
    grandMean: Number(grandMean.toFixed(2)),
    ssb: Number(ssb.toFixed(2)),
    ssw: Number(ssw.toFixed(2)),
    dfBetween,
    dfWithin,
    msb: Number(msb.toFixed(2)),
    msw: Number(msw.toFixed(2)),
    fStat: Number(fStat.toFixed(3)),
    pVal,
  };
}
