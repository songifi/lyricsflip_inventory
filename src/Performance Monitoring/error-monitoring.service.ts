import { Injectable, Logger } from '@nestjs/common';
import { PerformanceService, ErrorMetrics } from './performance.service';
import { AlertingService } from './alerting.service';

@Injectable()
export class ErrorMonitoringService {
  private readonly logger = new Logger(ErrorMonitoringService.name);

  constructor(
    private performanceService: PerformanceService,
    private alertingService: AlertingService,
  ) {}

  recordError(error: any, context?: {
    endpoint?: string;
    method?: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
  }) {
    const errorMetric: ErrorMetrics = {
      message: error.message || 'Unknown error',
      stack: error.stack || '',
      endpoint: context?.endpoint,
      method: context?.method,
      timestamp: new Date(),
      statusCode: error.status || error.statusCode,
      userId: context?.userId,
    };

    this.performanceService.recordError(errorMetric);
    
    // Check if we need to send alerts
    this.checkForAlerts(errorMetric);
    
    // Log the error
    this.logger.error(`Error recorded: ${error.message}`, {
      ...errorMetric,
      context,
    });
  }

  private async checkForAlerts(error: ErrorMetrics) {
    // Check error rate in the last 5 minutes
    const recentErrors = this.performanceService.getErrorMetrics(5);
    const recentApiCalls = this.performanceService.getApiMetrics(5);
    
    if (recentApiCalls.length > 0) {
      const errorRate = (recentErrors.length / recentApiCalls.length) * 100;
      
      if (errorRate > 10) { // Alert if error rate > 10%
        await this.alertingService.sendAlert({
          type: 'HIGH_ERROR_RATE',
          message: `High error rate detected: ${errorRate.toFixed(2)}%`,
          severity: 'HIGH',
          details: {
            errorRate,
            recentErrors: recentErrors.length,
            recentRequests: recentApiCalls.length,
            timeWindow: '5 minutes',
          },
        });
      }
    }

    // Check for repeated errors
    const sameErrors = recentErrors.filter(e => e.message === error.message);
    if (sameErrors.length >= 5) { // Alert if same error occurs 5+ times
      await this.alertingService.sendAlert({
        type: 'REPEATED_ERROR',
        message: `Repeated error detected: ${error.message}`,
        severity: 'MEDIUM',
        details: {
          errorMessage: error.message,
          occurrences: sameErrors.length,
          timeWindow: '5 minutes',
          endpoint: error.endpoint,
        },
      });
    }
  }
}
