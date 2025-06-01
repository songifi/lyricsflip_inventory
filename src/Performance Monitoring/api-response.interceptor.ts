import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { PerformanceService } from './performance.service';
import { ErrorMonitoringService } from './error-monitoring.service';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ApiResponseInterceptor.name);

  constructor(
    private performanceService: PerformanceService,
    private errorMonitoringService: ErrorMonitoringService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - startTime;
        
        this.performanceService.recordApiMetric({
          endpoint: request.route?.path || request.url,
          method: request.method,
          responseTime,
          statusCode: response.statusCode,
          timestamp: new Date(),
          userAgent: request.headers['user-agent'],
          ip: request.ip,
        });
      }),
      catchError((error) => {
        const responseTime = Date.now() - startTime;
        
        // Record API metric for error
        this.performanceService.recordApiMetric({
          endpoint: request.route?.path || request.url,
          method: request.method,
          responseTime,
          statusCode: error.status || 500,
          timestamp: new Date(),
          userAgent: request.headers['user-agent'],
          ip: request.ip,
        });

        // Record error
        this.errorMonitoringService.recordError(error, {
          endpoint: request.route?.path || request.url,
          method: request.method,
          userAgent: request.headers['user-agent'],
          ip: request.ip,
        });

        throw error;
      }),
    );
  }
}
