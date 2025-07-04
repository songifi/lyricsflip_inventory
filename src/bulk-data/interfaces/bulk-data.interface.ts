export interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: ImportError[];
  data?: any[];
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface BulkUpdateResult {
  success: boolean;
  totalItems: number;
  successfulItems: number;
  failedItems: number;
  errors: BulkUpdateError[];
}

export interface BulkUpdateError {
  id: string;
  message: string;
  data?: any;
}