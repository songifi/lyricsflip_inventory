export class HealthResponseDto {
  status: "ok" | "error" | "shutting_down";
  info?: Record<string, any>;
  error?: Record<string, any>;
  details: Record<string, any>;
}

export class SystemMetricsDto {
  memory: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  uptime: number;
  timestamp: string;
}
