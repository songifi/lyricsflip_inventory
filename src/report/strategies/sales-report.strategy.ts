export interface ReportStrategy {
    generate(config: any): Promise<any[]>;
  }
  