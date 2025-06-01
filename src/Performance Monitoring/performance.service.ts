import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import * as os from 'os';
import * as process from 'process';

export interface PerformanceMetrics {
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  uptime: number;
  eventLoopDelay: number;
  gc?: {
    collections: number;
    duration: number;
  };
}

export interface ApiMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
}

export interface DatabaseMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  table?: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'OTHER';
  rowsAffected?: number;
}

export interface ErrorMetrics {
  message: string;
  stack: string;
  endpoint?: string;
  method?: string;
  timestamp: Date;
  statusCode?: number;
  userId?: string;
}

@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);
  private metrics: PerformanceMetrics[] = [];
  private apiMetrics: ApiMetrics[] = [];
  private dbMetrics: DatabaseMetrics[] = [];
  private errorMetrics: ErrorMetrics[] = [];
  private readonly maxMetricsHistory = 10000;

  constructor(private schedulerRegistry: SchedulerRegistry) {
    this.startPerformanceCollection();
  }

  private startPerformanceCollection() {
    const job = new CronJob('*/10 * * * * *', () => {
      this.collectSystemMetrics();
    });

    this.schedulerRegistry.addCronJob('performance-collection', job);
    job.start();
  }

  private async collectSystemMetrics() {
    const startTime = process.hrtime.bigint();
    
    // Simulate event loop delay measurement
    setTimeout(() => {
      const endTime = process.hrtime.bigint();
      const eventLoopDelay = Number(endTime - startTime) / 1000000; // Convert to ms

      const memUsage = process.memoryUsage();
      const totalMem = os.totalmem();
      
      const metrics: PerformanceMetrics = {
        timestamp: new Date(),
        cpuUsage: this.getCpuUsage(),
        memoryUsage: {
          used: memUsage.heapUsed,
          total: totalMem,
          percentage: (memUsage.heapUsed / totalMem) * 100,
        },
        uptime: process.uptime(),
        eventLoopDelay,
        gc: this.getGCMetrics(),
      };

      this.addMetric(metrics);
    }, 0);
  }

  private getCpuUsage(): number {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    return 100 - (totalIdle / totalTick) * 100;
  }

  private getGCMetrics() {
    if (global.gc) {
      const before = process.memoryUsage();
      const start = Date.now();
      global.gc();
      const duration = Date.now() - start;
      const after = process.memoryUsage();
      
      return {
        collections: 1,
        duration,
      };
    }
    return undefined;
  }

  private addMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }
  }

  // API Metrics Methods
  recordApiMetric(metric: ApiMetrics) {
    this.apiMetrics.push(metric);
    if (this.apiMetrics.length > this.maxMetricsHistory) {
      this.apiMetrics = this.apiMetrics.slice(-this.maxMetricsHistory);
    }
    
    // Log slow requests
    if (metric.responseTime > 1000) {
      this.logger.warn(`Slow API request detected: ${metric.method} ${metric.endpoint} - ${metric.responseTime}ms`);
    }
  }

  // Database Metrics Methods
  recordDatabaseMetric(metric: DatabaseMetrics) {
    this.dbMetrics.push(metric);
    if (this.dbMetrics.length > this.maxMetricsHistory) {
      this.dbMetrics = this.dbMetrics.slice(-this.maxMetricsHistory);
    }

    // Log slow queries
    if (metric.duration > 100) {
      this.logger.warn(`Slow database query detected: ${metric.operation} - ${metric.duration}ms`);
    }
  }

  // Error Metrics Methods
  recordError(error: ErrorMetrics) {
    this.errorMetrics.push(error);
    if (this.errorMetrics.length > this.maxMetricsHistory) {
      this.errorMetrics = this.errorMetrics.slice(-this.maxMetricsHistory);
    }
  }

  // Analytics Methods
  getPerformanceMetrics(minutes = 60): PerformanceMetrics[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.metrics.filter(m => m.timestamp >= cutoff);
  }

  getApiMetrics(minutes = 60): ApiMetrics[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.apiMetrics.filter(m => m.timestamp >= cutoff);
  }

  getDatabaseMetrics(minutes = 60): DatabaseMetrics[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.dbMetrics.filter(m => m.timestamp >= cutoff);
  }

  getErrorMetrics(minutes = 60): ErrorMetrics[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.errorMetrics.filter(m => m.timestamp >= cutoff);
  }

  getApiAnalytics(minutes = 60) {
    const metrics = this.getApiMetrics(minutes);
    
    if (metrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        slowRequests: 0,
        endpointStats: {},
      };
    }

    const totalRequests = metrics.length;
    const averageResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests;
    const errorRequests = metrics.filter(m => m.statusCode >= 400).length;
    const errorRate = (errorRequests / totalRequests) * 100;
    const slowRequests = metrics.filter(m => m.responseTime > 1000).length;

    const endpointStats = metrics.reduce((acc, metric) => {
      const key = `${metric.method} ${metric.endpoint}`;
      if (!acc[key]) {
        acc[key] = {
          count: 0,
          avgResponseTime: 0,
          errors: 0,
          totalResponseTime: 0,
        };
      }
      acc[key].count++;
      acc[key].totalResponseTime += metric.responseTime;
      acc[key].avgResponseTime = acc[key].totalResponseTime / acc[key].count;
      if (metric.statusCode >= 400) {
        acc[key].errors++;
      }
      return acc;
    }, {});

    return {
      totalRequests,
      averageResponseTime: Math.round(averageResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      slowRequests,
      endpointStats,
    };
  }

  getDatabaseAnalytics(minutes = 60) {
    const metrics = this.getDatabaseMetrics(minutes);
    
    if (metrics.length === 0) {
      return {
        totalQueries: 0,
        averageQueryTime: 0,
        slowQueries: 0,
        operationStats: {},
      };
    }

    const totalQueries = metrics.length;
    const averageQueryTime = metrics.reduce((sum, m) => sum + m.duration, 0) / totalQueries;
    const slowQueries = metrics.filter(m => m.duration > 100).length;

    const operationStats = metrics.reduce((acc, metric) => {
      if (!acc[metric.operation]) {
        acc[metric.operation] = {
          count: 0,
          avgDuration: 0,
          totalDuration: 0,
          slowQueries: 0,
        };
      }
      acc[metric.operation].count++;
      acc[metric.operation].totalDuration += metric.duration;
      acc[metric.operation].avgDuration = acc[metric.operation].totalDuration / acc[metric.operation].count;
      if (metric.duration > 100) {
        acc[metric.operation].slowQueries++;
      }
      return acc;
    }, {});

    return {
      totalQueries,
      averageQueryTime: Math.round(averageQueryTime),
      slowQueries,
      operationStats,
    };
  }
}
