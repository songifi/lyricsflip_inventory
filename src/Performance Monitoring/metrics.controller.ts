import { Controller, Get, Query } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { AlertingService } from './alerting.service';

@Controller('metrics')
export class MetricsController {
  constructor(
    private performanceService: PerformanceService,
    private alertingService: AlertingService,
  ) {}

  @Get('system')
  getSystemMetrics(@Query('minutes') minutes = 60) {
    return {
      performance: this.performanceService.getPerformanceMetrics(+minutes),
      summary: this.getSystemSummary(+minutes),
    };
  }

  @Get('api')
  getApiMetrics(@Query('minutes') minutes = 60) {
    return {
      metrics: this.performanceService.getApiMetrics(+minutes),
      analytics: this.performanceService.getApiAnalytics(+minutes),
    };
  }

  @Get('database')
  getDatabaseMetrics(@Query('minutes') minutes = 60) {
    return {
      metrics: this.performanceService.getDatabaseMetrics(+minutes),
      analytics: this.performanceService.getDatabaseAnalytics(+minutes),
    };
  }

  @Get('errors')
  getErrorMetrics(@Query('minutes') minutes = 60) {
    return {
      errors: this.performanceService.getErrorMetrics(+minutes),
      summary: this.getErrorSummary(+minutes),
    };
  }

  @Get('alerts')
  getAlerts(@Query('minutes') minutes = 60) {
    return {
      alerts: this.alertingService.getRecentAlerts(+minutes),
      summary: this.getAlertsSummary(+minutes),
    };
  }

  @Get('dashboard')
  getDashboardData(@Query('minutes') minutes = 60) {
    return {
      system: this.getSystemSummary(+minutes),
      api: this.performanceService.getApiAnalytics(+minutes),
      database: this.performanceService.getDatabaseAnalytics(+minutes),
      errors: this.getErrorSummary(+minutes),
      alerts: this.getAlertsSummary(+minutes),
    };
  }

  private getSystemSummary(minutes: number) {
    const metrics = this.performanceService.getPerformanceMetrics(minutes);
    
    if (metrics.length === 0) {
      return {
        avgCpuUsage: 0,
        avgMemoryUsage: 0,
        avgEventLoopDelay: 0,
        uptime: 0,
      };
    }

    return {
      avgCpuUsage: Math.round(metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / metrics.length),
      avgMemoryUsage: Math.round(metrics.reduce((sum, m) => sum + m.memoryUsage.percentage, 0) / metrics.length),
      avgEventLoopDelay: Math.round(metrics.reduce((sum, m) => sum + m.eventLoopDelay, 0) / metrics.length),
      uptime: metrics[metrics.length - 1]?.uptime || 0,
    };
  }

  private getErrorSummary(minutes: number) {
    const errors = this.performanceService.getErrorMetrics(minutes);
    const errorsByType = errors.reduce((acc, error) => {
      const key = error.statusCode?.toString() || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      totalErrors: errors.length,
      errorsByType,
      recentErrors: errors.slice(-10),
    };
  }

  private getAlertsSummary(minutes: number) {
    const alerts = this.alertingService.getRecentAlerts(minutes);
    const alertsBySeverity = alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {});

    return {
      totalAlerts: alerts.length,
      alertsBySeverity,
      recentAlerts: alerts.slice(-5),
    };
  }
}
