import { Injectable, Logger } from '@nestjs/common';
import { PerformanceService, DatabaseMetrics } from './performance.service';

@Injectable()
export class DatabaseMonitoringService {
  private readonly logger = new Logger(DatabaseMonitoringService.name);

  constructor(private performanceService: PerformanceService) {}

  // Decorator for monitoring database operations
  static MonitorQuery(operation: DatabaseMetrics['operation'] = 'OTHER') {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        const startTime = Date.now();
        const service = this.databaseMonitoringService || 
          this.constructor.prototype.databaseMonitoringService;

        try {
          const result = await originalMethod.apply(this, args);
          const duration = Date.now() - startTime;

          if (service) {
            service.recordQuery({
              query: `${target.constructor.name}.${propertyKey}`,
              duration,
              timestamp: new Date(),
              operation,
              rowsAffected: Array.isArray(result) ? result.length : 1,
            });
          }

          return result;
        } catch (error) {
          const duration = Date.now() - startTime;
          
          if (service) {
            service.recordQuery({
              query: `${target.constructor.name}.${propertyKey} (ERROR)`,
              duration,
              timestamp: new Date(),
              operation,
            });
          }
          
          throw error;
        }
      };
    };
  }

  recordQuery(metric: DatabaseMetrics) {
    this.performanceService.recordDatabaseMetric(metric);
  }

  // Method to wrap TypeORM queries
  wrapTypeORMQuery<T>(queryPromise: Promise<T>, queryInfo: Partial<DatabaseMetrics>): Promise<T> {
    const startTime = Date.now();
    
    return queryPromise
      .then((result) => {
        const duration = Date.now() - startTime;
        
        this.recordQuery({
          query: queryInfo.query || 'Unknown Query',
          duration,
          timestamp: new Date(),
          operation: queryInfo.operation || 'OTHER',
          table: queryInfo.table,
          rowsAffected: Array.isArray(result) ? result.length : 1,
        });
        
        return result;
      })
      .catch((error) => {
        const duration = Date.now() - startTime;
        
        this.recordQuery({
          query: `${queryInfo.query || 'Unknown Query'} (ERROR)`,
          duration,
          timestamp: new Date(),
          operation: queryInfo.operation || 'OTHER',
          table: queryInfo.table,
        });
        
        throw error;
      });
  }

  // Method to monitor raw SQL queries
  async executeMonitoredQuery<T>(
    executor: () => Promise<T>,
    queryInfo: Partial<DatabaseMetrics>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await executor();
      const duration = Date.now() - startTime;
      
      this.recordQuery({
        query: queryInfo.query || 'Raw Query',
        duration,
        timestamp: new Date(),
        operation: queryInfo.operation || 'OTHER',
        table: queryInfo.table,
        rowsAffected: Array.isArray(result) ? result.length : 1,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.recordQuery({
        query: `${queryInfo.query || 'Raw Query'} (ERROR)`,
        duration,
        timestamp: new Date(),
        operation: queryInfo.operation || 'OTHER',
        table: queryInfo.table,
      });
      
      throw error;
    }
  }
}
