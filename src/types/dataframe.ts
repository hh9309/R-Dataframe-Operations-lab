export type RType = 'numeric' | 'integer' | 'character' | 'factor' | 'Date' | 'logical';

export interface ColumnDef {
  name: string;
  type: RType;
  label?: string;
  levels?: string[]; // for factor
  description?: string;
}

export type RowData = Record<string, any>;

export interface DataFrame {
  id: string;
  name: string;
  description: string;
  columns: ColumnDef[];
  data: RowData[];
  hasRowNames?: boolean;
  rowNames?: string[];
  isGrouped?: boolean;
  groupByCols?: string[];
}

export type FilterOperator = '==' | '!=' | '>' | '>=' | '<' | '<=' | '%in%' | 'is.na' | '!is.na' | 'between' | 'starts_with';

export interface FilterCondition {
  id: string;
  column: string;
  operator: FilterOperator;
  value: any;
  value2?: any; // for between
  logic: '&' | '|';
}

export type AggregationFunction = 'mean' | 'sum' | 'count' | 'sd' | 'median' | 'min' | 'max' | 'n_distinct';

export interface AggregationTarget {
  column: string;
  fn: AggregationFunction;
  alias: string;
  naRm: boolean;
}

export type JoinType = 'left_join' | 'right_join' | 'inner_join' | 'full_join' | 'semi_join' | 'anti_join';

export interface DiagnosticIssue {
  id: string;
  level: 'critical' | 'warning' | 'info';
  category: 'ungroup' | 'na_propagation' | 'factor_mismatch' | 'row_names' | 'dirty_aggregation' | 'dimension';
  title: string;
  description: string;
  codeSuggestion?: string;
  academicRef?: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  mapping: string;
  domain: string;
  description: string;
  iconName: string;
  defaultRCode: string;
  explanation: string;
  datasetId: string;
}
