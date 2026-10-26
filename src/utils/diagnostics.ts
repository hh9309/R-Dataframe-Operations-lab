import { DataFrame, DiagnosticIssue } from '../types/dataframe';

export function runComprehensiveDiagnostics(
  df: DataFrame,
  pipelineCode: string = '',
  isGroupedContext: boolean = false
): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = [];

  // 1. Ungroup Omission Check
  if (isGroupedContext || (pipelineCode.includes('group_by') && !pipelineCode.includes('ungroup') && !pipelineCode.includes('.groups = "drop"'))) {
    issues.push({
      id: 'iss_ungroup',
      level: 'critical',
      category: 'ungroup',
      title: '分组后未显式解组风险 (Missing ungroup() / .groups = "drop")',
      description:
        '在 dplyr 中，group_by() 会将分组属性 (groups metadata) 附着在 tibble 上。在后续管道调用 mutate()（如计算全局占比 val / sum(val)）或跨表 join 时，计算仍将在局部子集内切片执行，导致统计基准严重失真！',
      codeSuggestion: 'df %>% group_by(...) %>% summarise(..., .groups = "drop") # 或在末端补充 %>% ungroup()',
      academicRef: 'Hadley Wickham (2023), R for Data Science (2e): "Unless specified, summarise() drops the last grouping level, leaving residual groups."'
    });
  }

  // 2. NA Propagation Risk
  const columnsWithNA = df.columns.filter((c) =>
    df.data.some((r) => r[c.name] === null || r[c.name] === undefined || Number.isNaN(r[c.name]))
  );

  if (columnsWithNA.length > 0) {
    const naColNames = columnsWithNA.map((c) => c.name).join(', ');
    const codeHasNoNaRm =
      pipelineCode.includes('mean(') || pipelineCode.includes('sum(') || pipelineCode.includes('sd(');
    const mentionsNaRm = pipelineCode.includes('na.rm');

    if (codeHasNoNaRm && !mentionsNaRm) {
      issues.push({
        id: 'iss_na_propagation',
        level: 'critical',
        category: 'na_propagation',
        title: '隐性缺失值 (NA) 污染算子风险',
        description: `检测到字段 [${naColNames}] 包含缺失值 (NA)。R 语言遵循三值逻辑与代数传染性：任何数值与 NA 运算均返回 NA。在 mean()、sum() 中未设定 na.rm = TRUE 将导致整个聚合统计量坍塌为 NA！`,
        codeSuggestion: 'summarise(avg_val = mean(target_col, na.rm = TRUE))',
        academicRef: 'John Chambers, Software for Data Analysis: Programming with R (NA representation & contagion).'
      });
    } else {
      issues.push({
        id: 'iss_na_present',
        level: 'warning',
        category: 'na_propagation',
        title: `数据集中存在缺失值列 [${naColNames}]`,
        description: '建议在管道前端使用 filter(!is.na(...)) 进行防御性清洗，或通过 tidyr::replace_na() / fill() 显式补全。',
        codeSuggestion: 'df %>% filter(!is.na(target_column))',
      });
    }
  }

  // 3. Row Names Misalignment Trap
  if (df.hasRowNames || df.rowNames?.length) {
    issues.push({
      id: 'iss_row_names',
      level: 'warning',
      category: 'row_names',
      title: '行名索引陷阱 (Row Names Misalignment)',
      description:
        '该数据集包含 Base R 传统的 row.names 属性。在现代化 tidyverse 管道流中，dplyr 算子不保留行名！混淆行名与真实列变量会导致基于列名切片或 join 时索引丢失错位。',
      codeSuggestion: 'library(tibble)\nclean_df <- rownames_to_column(df, var = "sample_id") %>% as_tibble()',
      academicRef: 'tidyverse design principle: "Tibbles do not support row names because data belongs in columns."'
    });
  }

  // 4. Dirty Data Raw Aggregation & Extreme Outliers
  const numericCols = df.columns.filter((c) => c.type === 'numeric' || c.type === 'integer');
  const suspectedOutliers: string[] = [];

  numericCols.forEach((col) => {
    const vals = df.data
      .map((r) => Number(r[col.name]))
      .filter((v) => !Number.isNaN(v) && v !== null && v !== undefined);
    if (vals.length >= 4) {
      const sorted = [...vals].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;

      const hasExtreme = vals.some((v) => v < lowerBound || v > upperBound);
      if (hasExtreme) {
        suspectedOutliers.push(col.name);
      }
    }
  });

  if (suspectedOutliers.length > 0) {
    issues.push({
      id: 'iss_outlier_mean',
      level: 'warning',
      category: 'dirty_aggregation',
      title: `误区警示：变量 [${suspectedOutliers.join(', ')}] 含显著离群点，切忌盲目直接求均值`,
      description:
        '均值 (Mean) 对极端值极度脆弱。若数据存在录入错误（如 9999 异常码）或重尾分布，盲目聚合将造成决策方向严重偏差。建议结合 median() 或 IQR 预先过滤。',
      codeSuggestion: 'df %>%\n  filter(between(col, quantile(col, 0.05), quantile(col, 0.95))) %>%\n  summarise(robust_avg = mean(col, na.rm = TRUE), median_val = median(col))',
    });
  }

  // 5. Factor Level Mismatch & Text Space Contamination
  const charCols = df.columns.filter((c) => c.type === 'character');
  const contaminatedTextCols = charCols.filter((col) =>
    df.data.some((r) => {
      const val = String(r[col.name] || '');
      return (val.startsWith(' ') || val.endsWith(' ')) || val === 'N/A' || val === 'NA' || val === 'null';
    })
  );

  if (contaminatedTextCols.length > 0) {
    issues.push({
      id: 'iss_text_contamination',
      level: 'warning',
      category: 'factor_mismatch',
      title: `字符型列文本空格或伪NA污染 [${contaminatedTextCols.map((c) => c.name).join(', ')}]`,
      description:
        '检测到文本字段内包含前后多余空格或未转义的 "N/A" 字符串。这会导致与因子水平匹配失败，或在 as.numeric() 时强制报错崩溃。',
      codeSuggestion: 'df %>% mutate(across(where(is.character), ~na_if(trimws(.x), "N/A")))',
    });
  }

  if (issues.length === 0) {
    issues.push({
      id: 'iss_clean',
      level: 'info',
      category: 'dimension',
      title: '代数结构健康度优良 (Tidy & Validated)',
      description: '未检测到致命解组污染或显性类型崩溃风险，符合 Hadley Wickham 整洁数据规范。',
    });
  }

  return issues;
}
