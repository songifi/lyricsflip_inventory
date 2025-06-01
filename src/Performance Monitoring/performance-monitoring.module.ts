import { Module, Global } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { DatabaseMonitoringService } from './database-monitoring.service';
import { ApiResponseInterceptor } from './api-response.interceptor';
import { ErrorMonitoringService } from './error-monitoring.service';
import { AlertingService } from './alerting.service';
import { MetricsController } from './metrics.controller';

@Global()
@Module({
  providers: [
    PerformanceService,
    DatabaseMonitoringService,
    ApiResponseInterceptor,
    ErrorMonitoringService,
    AlertingService,
  ],
  controllers: [MetricsController],
  exports: [
    PerformanceService,
    DatabaseMonitoringService,
    ErrorMonitoringService,
    AlertingService,
  ],
})
export class PerformanceMonitoringModule {}
