import { ReportType } from '../enums/report.enum';

export interface ReportConfig {
  type: ReportType;
  parameters: Record<string, any>;
  filters: Record<string, any>;
  groupBy?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CustomReportField {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  source: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  format?: string;
}

export interface CustomReportConfig extends ReportConfig {
  fields: CustomReportField[];
  joins?: Array<{
    table: string;
    on: string;
    type: 'inner' | 'left' | 'right';
  }>;
}
