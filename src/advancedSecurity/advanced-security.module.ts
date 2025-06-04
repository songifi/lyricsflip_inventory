import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EncryptionModule } from './encryption/encryption.module';
import { ApiSigningModule } from './api-signing/api-signing.module';
import { AuditModule } from './audit/audit.module';
import { SecurityMonitoringModule } from './security-monitoring/security-monitoring.module';

@Module({
  imports: [
    ConfigModule,
    EncryptionModule,
    ApiSigningModule,
    AuditModule,
    SecurityMonitoringModule,
  ],
})
export class AdvancedSecurityModule {}

// advancedSecurity/encryption/encryption.module.ts
import { Module } from '@nestjs/common';
import { EncryptionService } from './encryption.service';
import { DatabaseEncryptionInterceptor } from './database-encryption.interceptor';

@Module({
  providers: [EncryptionService, DatabaseEncryptionInterceptor],
  exports: [EncryptionService, DatabaseEncryptionInterceptor],
})
export class EncryptionModule {}

// advancedSecurity/encryption/encryption.service.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;
  private readonly encryptionKey: Buffer;

  constructor(private configService: ConfigService) {
    const key = this.configService.get<string>('ENCRYPTION_KEY');
    this.encryptionKey = key ? Buffer.from(key, 'hex') : crypto.randomBytes(this.keyLength);
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
    cipher.setAAD(Buffer.from('additional-data'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedData: string): string {
    const [ivHex, tagHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
    decipher.setAAD(Buffer.from('additional-data'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  verifyPassword(password: string, storedHash: string): boolean {
    const [salt, hash] = storedHash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }

  generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

// advancedSecurity/encryption/database-encryption.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EncryptionService } from './encryption.service';

@Injectable()
export class DatabaseEncryptionInterceptor implements NestInterceptor {
  constructor(private encryptionService: EncryptionService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Encrypt sensitive fields before saving
    if (request.body && this.shouldEncrypt(request)) {
      request.body = this.encryptSensitiveFields(request.body);
    }

    return next.handle().pipe(
      map(data => {
        // Decrypt sensitive fields when retrieving
        if (data && this.shouldDecrypt(context)) {
          return this.decryptSensitiveFields(data);
        }
        return data;
      })
    );
  }

  private shouldEncrypt(request: any): boolean {
    const encryptRoutes = ['/users', '/profiles', '/sensitive-data'];
    return encryptRoutes.some(route => request.url.includes(route));
  }

  private shouldDecrypt(context: ExecutionContext): boolean {
    const handler = context.getHandler().name;
    return ['findAll', 'findOne', 'find'].includes(handler);
  }

  private encryptSensitiveFields(data: any): any {
    const sensitiveFields = ['email', 'phone', 'ssn', 'creditCard'];
    const encrypted = { ...data };
    
    sensitiveFields.forEach(field => {
      if (encrypted[field]) {
        encrypted[field] = this.encryptionService.encrypt(encrypted[field]);
      }
    });
    
    return encrypted;
  }

  private decryptSensitiveFields(data: any): any {
    if (Array.isArray(data)) {
      return data.map(item => this.decryptSensitiveFields(item));
    }
    
    const sensitiveFields = ['email', 'phone', 'ssn', 'creditCard'];
    const decrypted = { ...data };
    
    sensitiveFields.forEach(field => {
      if (decrypted[field] && typeof decrypted[field] === 'string') {
        try {
          decrypted[field] = this.encryptionService.decrypt(decrypted[field]);
        } catch (error) {
          // Field might not be encrypted
        }
      }
    });
    
    return decrypted;
  }
}

// advancedSecurity/api-signing/api-signing.module.ts
import { Module } from '@nestjs/common';
import { ApiSigningService } from './api-signing.service';
import { ApiSignatureMiddleware } from './api-signature.middleware';
import { ApiSignatureGuard } from './api-signature.guard';

@Module({
  providers: [ApiSigningService, ApiSignatureMiddleware, ApiSignatureGuard],
  exports: [ApiSigningService, ApiSignatureMiddleware, ApiSignatureGuard],
})
export class ApiSigningModule {}

// advancedSecurity/api-signing/api-signing.service.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiSigningService {
  private readonly secretKey: string;
  private readonly algorithm = 'sha256';

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('API_SECRET_KEY') || 'default-secret-key';
  }

  generateSignature(payload: string, timestamp: string, nonce: string): string {
    const message = `${timestamp}${nonce}${payload}`;
    return crypto.createHmac(this.algorithm, this.secretKey)
                 .update(message)
                 .digest('hex');
  }

  verifySignature(
    payload: string,
    timestamp: string,
    nonce: string,
    signature: string
  ): boolean {
    const expectedSignature = this.generateSignature(payload, timestamp, nonce);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  isTimestampValid(timestamp: string, toleranceMs: number = 300000): boolean {
    const now = Date.now();
    const requestTime = parseInt(timestamp);
    return Math.abs(now - requestTime) <= toleranceMs;
  }

  generateNonce(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  generateApiKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  generateApiSecret(): string {
    return crypto.randomBytes(64).toString('hex');
  }
}

// advancedSecurity/api-signing/api-signature.middleware.ts
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ApiSigningService } from './api-signing.service';

@Injectable()
export class ApiSignatureMiddleware implements NestMiddleware {
  private usedNonces = new Set<string>();

  constructor(private apiSigningService: ApiSigningService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Skip signature verification for public endpoints
    if (this.isPublicEndpoint(req.path)) {
      return next();
    }

    const signature = req.headers['x-signature'] as string;
    const timestamp = req.headers['x-timestamp'] as string;
    const nonce = req.headers['x-nonce'] as string;
    const apiKey = req.headers['x-api-key'] as string;

    if (!signature || !timestamp || !nonce || !apiKey) {
      throw new UnauthorizedException('Missing required signature headers');
    }

    // Check timestamp validity
    if (!this.apiSigningService.isTimestampValid(timestamp)) {
      throw new UnauthorizedException('Request timestamp is invalid');
    }

    // Check nonce uniqueness (prevent replay attacks)
    if (this.usedNonces.has(nonce)) {
      throw new UnauthorizedException('Nonce has already been used');
    }

    // Verify signature
    const payload = JSON.stringify(req.body) || '';
    if (!this.apiSigningService.verifySignature(payload, timestamp, nonce, signature)) {
      throw new UnauthorizedException('Invalid signature');
    }

    // Add nonce to used set (in production, use Redis with expiration)
    this.usedNonces.add(nonce);
    
    // Clean up old nonces (simple in-memory cleanup)
    if (this.usedNonces.size > 10000) {
      this.usedNonces.clear();
    }

    next();
  }

  private isPublicEndpoint(path: string): boolean {
    const publicPaths = ['/health', '/docs', '/auth/login', '/auth/register'];
    return publicPaths.some(publicPath => path.startsWith(publicPath));
  }
}

// advancedSecurity/api-signing/api-signature.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiSigningService } from './api-signing.service';

@Injectable()
export class ApiSignatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private apiSigningService: ApiSigningService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const signature = request.headers['x-signature'];
    const timestamp = request.headers['x-timestamp'];
    const nonce = request.headers['x-nonce'];

    if (!signature || !timestamp || !nonce) {
      throw new UnauthorizedException('Missing signature headers');
    }

    const payload = JSON.stringify(request.body) || '';
    const isValid = this.apiSigningService.verifySignature(payload, timestamp, nonce, signature);

    if (!isValid) {
      throw new UnauthorizedException('Invalid API signature');
    }

    return true;
  }
}

// advancedSecurity/audit/audit.module.ts
import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditInterceptor } from './audit.interceptor';
import { AuditController } from './audit.controller';

@Module({
  providers: [AuditService, AuditInterceptor],
  controllers: [AuditController],
  exports: [AuditService, AuditInterceptor],
})
export class AuditModule {}

// advancedSecurity/audit/audit.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  method: string;
  url: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  duration: number;
  statusCode: number;
  requestBody?: any;
  responseBody?: any;
  metadata?: any;
}

@Injectable()
export class AuditService {
  private auditLogs: AuditLog[] = [];
  private readonly maxLogs = 10000;

  constructor(private configService: ConfigService) {}

  async logActivity(auditData: Partial<AuditLog>): Promise<void> {
    const auditLog: AuditLog = {
      id: this.generateId(),
      timestamp: new Date(),
      ...auditData,
    } as AuditLog;

    // In production, save to database or external logging service
    this.auditLogs.unshift(auditLog);
    
    // Keep only recent logs in memory
    if (this.auditLogs.length > this.maxLogs) {
      this.auditLogs = this.auditLogs.slice(0, this.maxLogs);
    }

    // Send to external logging service if configured
    await this.sendToExternalService(auditLog);
  }

  async getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AuditLog[]> {
    let logs = [...this.auditLogs];

    if (filters) {
      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
      }
      if (filters.action) {
        logs = logs.filter(log => log.action.includes(filters.action));
      }
      if (filters.startDate) {
        logs = logs.filter(log => log.timestamp >= filters.startDate);
      }
      if (filters.endDate) {
        logs = logs.filter(log => log.timestamp <= filters.endDate);
      }
      if (filters.limit) {
        logs = logs.slice(0, filters.limit);
      }
    }

    return logs;
  }

  async getSecurityEvents(): Promise<AuditLog[]> {
    const securityActions = [
      'LOGIN_FAILED',
      'PASSWORD_CHANGED',
      'ACCOUNT_LOCKED',
      'UNAUTHORIZED_ACCESS',
      'SUSPICIOUS_ACTIVITY'
    ];

    return this.auditLogs.filter(log => 
      securityActions.some(action => log.action.includes(action))
    );
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendToExternalService(auditLog: AuditLog): Promise<void> {
    const externalUrl = this.configService.get<string>('AUDIT_WEBHOOK_URL');
    if (externalUrl) {
      try {
        // In production, use HTTP client to send to external service
        console.log('Sending audit log to external service:', auditLog.id);
      } catch (error) {
        console.error('Failed to send audit log to external service:', error);
      }
    }
  }
}

// advancedSecurity/audit/audit.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const auditData = {
      method: request.method,
      url: request.url,
      ip: request.ip || request.connection.remoteAddress,
      userAgent: request.headers['user-agent'],
      userId: request.user?.id,
      requestBody: this.sanitizeBody(request.body),
    };

    return next.handle().pipe(
      tap(responseBody => {
        const duration = Date.now() - startTime;
        this.auditService.logActivity({
          ...auditData,
          action: `${request.method}_${this.extractResource(request.url)}`,
          resource: this.extractResource(request.url),
          duration,
          statusCode: response.statusCode,
          responseBody: this.sanitizeBody(responseBody),
        });
      }),
      catchError(error => {
        const duration = Date.now() - startTime;
        this.auditService.logActivity({
          ...auditData,
          action: `${request.method}_${this.extractResource(request.url)}_ERROR`,
          resource: this.extractResource(request.url),
          duration,
          statusCode: error.status || 500,
          metadata: { error: error.message },
        });
        throw error;
      })
    );
  }

  private extractResource(url: string): string {
    const segments = url.split('/').filter(Boolean);
    return segments[0] || 'root';
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'creditCard'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
}

// advancedSecurity/audit/audit.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService, AuditLog } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get('logs')
  async getAuditLogs(
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ): Promise<AuditLog[]> {
    const filters = {
      userId,
      action,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    };

    return this.auditService.getAuditLogs(filters);
  }

  @Get('security-events')
  async getSecurityEvents(): Promise<AuditLog[]> {
    return this.auditService.getSecurityEvents();
  }
}

// advancedSecurity/security-monitoring/security-monitoring.module.ts
import { Module } from '@nestjs/common';
import { SecurityMonitoringService } from './security-monitoring.service';
import { SecurityAlertsService } from './security-alerts.service';
import { SecurityMonitoringController } from './security-monitoring.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  providers: [SecurityMonitoringService, SecurityAlertsService],
  controllers: [SecurityMonitoringController],
  exports: [SecurityMonitoringService, SecurityAlertsService],
})
export class SecurityMonitoringModule {}

// advancedSecurity/security-monitoring/security-monitoring.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuditService } from '../audit/audit.service';
import { SecurityAlertsService } from './security-alerts.service';

export interface SecurityMetrics {
  totalRequests: number;
  failedLogins: number;
  suspiciousActivities: number;
  apiErrors: number;
  uniqueIPs: number;
  averageResponseTime: number;
  timestamp: Date;
}

export interface SecurityThreat {
  id: string;
  type: 'BRUTE_FORCE' | 'SUSPICIOUS_IP' | 'RATE_LIMIT_EXCEEDED' | 'ANOMALOUS_BEHAVIOR';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  ip: string;
  userId?: string;
  timestamp: Date;
  metadata: any;
}

@Injectable()
export class SecurityMonitoringService {
  private securityMetrics: SecurityMetrics[] = [];
  private detectedThreats: SecurityThreat[] = [];
  private ipRequestCounts = new Map<string, number>();
  private ipFailedLogins = new Map<string, number>();

  constructor(
    private auditService: AuditService,
    private securityAlertsService: SecurityAlertsService
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async analyzeSecurityMetrics(): Promise<void> {
    const logs = await this.auditService.getAuditLogs({
      startDate: new Date(Date.now() - 60000), // Last minute
    });

    const metrics = this.calculateMetrics(logs);
    this.securityMetrics.push(metrics);

    // Keep only last 24 hours of metrics
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.securityMetrics = this.securityMetrics.filter(m => m.timestamp > oneDayAgo);

    await this.detectThreats(logs);
  }

  private calculateMetrics(logs: any[]): SecurityMetrics {
    const uniqueIPs = new Set(logs.map(log => log.ip)).size;
    const failedLogins = logs.filter(log => 
      log.action.includes('LOGIN') && log.statusCode >= 400
    ).length;
    const suspiciousActivities = logs.filter(log => 
      this.isSuspiciousActivity(log)
    ).length;
    const apiErrors = logs.filter(log => log.statusCode >= 500).length;
    const averageResponseTime = logs.length > 0 
      ? logs.reduce((sum, log) => sum + log.duration, 0) / logs.length 
      : 0;

    return {
      totalRequests: logs.length,
      failedLogins,
      suspiciousActivities,
      apiErrors,
      uniqueIPs,
      averageResponseTime,
      timestamp: new Date(),
    };
  }

  private async detectThreats(logs: any[]): Promise<void> {
    // Reset hourly counters
    if (new Date().getMinutes() === 0) {
      this.ipRequestCounts.clear();
      this.ipFailedLogins.clear();
    }

    for (const log of logs) {
      // Track IP request counts
      const currentCount = this.ipRequestCounts.get(log.ip) || 0;
      this.ipRequestCounts.set(log.ip, currentCount + 1);

      // Track failed logins per IP
      if (log.action.includes('LOGIN') && log.statusCode >= 400) {
        const failedCount = this.ipFailedLogins.get(log.ip) || 0;
        this.ipFailedLogins.set(log.ip, failedCount + 1);
      }

      // Detect rate limiting threshold
      if (this.ipRequestCounts.get(log.ip) > 1000) {
        await this.createThreat({
          type: 'RATE_LIMIT_EXCEEDED',
          severity: 'HIGH',
          description: `IP ${log.ip} exceeded rate limit with ${this.ipRequestCounts.get(log.ip)} requests`,
          ip: log.ip,
          userId: log.userId,
          metadata: { requestCount: this.ipRequestCounts.get(log.ip) },
        });
      }

      // Detect brute force attacks
      if (this.ipFailedLogins.get(log.ip) > 10) {
        await this.createThreat({
          type: 'BRUTE_FORCE',
          severity: 'CRITICAL',
          description: `Potential brute force attack from IP ${log.ip}`,
          ip: log.ip,
          userId: log.userId,
          metadata: { failedLoginCount: this.ipFailedLogins.get(log.ip) },
        });
      }

      // Detect suspicious activities
      if (this.isSuspiciousActivity(log)) {
        await this.createThreat({
          type: 'ANOMALOUS_BEHAVIOR',
          severity: 'MEDIUM',
          description: `Suspicious activity detected: ${log.action}`,
          ip: log.ip,
          userId: log.userId,
          metadata: { logDetails: log },
        });
      }
    }
  }

  private isSuspiciousActivity(log: any): boolean {
    const suspiciousPatterns = [
      /sql injection/i,
      /script/i,
      /<script>/i,
      /union select/i,
      /drop table/i,
      /\.\.\/\.\.\//,
    ];

    const logStr = JSON.stringify(log).toLowerCase();
    return suspiciousPatterns.some(pattern => pattern.test(logStr));
  }

  private async createThreat(threatData: Partial<SecurityThreat>): Promise<void> {
    const threat: SecurityThreat = {
      id: this.generateThreatId(),
      timestamp: new Date(),
      ...threatData,
    } as SecurityThreat;

    this.detectedThreats.push(threat);

    // Keep only last 1000 threats
    if (this.detectedThreats.length > 1000) {
      this.detectedThreats = this.detectedThreats.slice(-1000);
    }

    await this.securityAlertsService.sendAlert(threat);
  }

  async getSecurityMetrics(hours = 24): Promise<SecurityMetrics[]> {
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.securityMetrics.filter(m => m.timestamp > startTime);
  }

  async getThreats(severity?: string): Promise<SecurityThreat[]> {
    if (severity) {
      return this.detectedThreats.filter(t => t.severity === severity);
    }
    return this.detectedThreats;
  }

  async getDashboardData(): Promise<any> {
    const recentMetrics = await this.getSecurityMetrics(1);
    const currentMetrics = recentMetrics[recentMetrics.length - 1] || {
      totalRequests: 0,
      failedLogins: 0,
      suspiciousActivities: 0,
      apiErrors: 0,
      uniqueIPs: 0,
      averageResponseTime: 0,
    };

    const threats = await this.getThreats();
    const threatCounts = {
      critical: threats.filter(t => t.severity === 'CRITICAL').length,
      high: threats.filter(t => t.severity === 'HIGH').length,
      medium: threats.filter(t => t.severity === 'MEDIUM').length,
      low: threats.filter(t => t.severity === 'LOW').length,
    };

    return {
      currentMetrics,
      threatCounts,
      recentThreats: threats.slice(-10),
      metricsHistory: recentMetrics,
    };
  }

  private generateThreatId(): string {
    return `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// advancedSecurity/security-monitoring/security-alerts.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SecurityThreat } from './security-monitoring.service';

export interface AlertChannel {
  type: 'EMAIL' | 'SLACK' | 'WEBHOOK' | 'SMS';
  config: any;
  enabled: boolean;
}

@Injectable()
export class SecurityAlertsService {
  private alertChannels: AlertChannel[] = [];

  constructor(private configService: ConfigService) {
    this.initializeAlertChannels();
  }

  private initializeAlertChannels(): void {
    // Email alerts
    if (this.configService.get('ALERT_EMAIL_ENABLED')) {
      this.alertChannels.push({
        type: 'EMAIL',
        config: {
          to: this.configService.get('ALERT_EMAIL_TO'),
          from: this.configService.get('ALERT_EMAIL_FROM'),
        },
        enabled: true,
      });
    }

    // Slack alerts
    if (this.configService.get('ALERT_SLACK_WEBHOOK')) {
      this.alertChannels.push({
        type: 'SLACK',
        config: {
          webhookUrl: this.configService.get('ALERT_SLACK_WEBHOOK'),
          channel: this.configService.get('ALERT_SLACK_CHANNEL') || '#security',
        },
        enabled: true,
      });
    }

    // Custom webhook alerts
    if (this.configService.get('ALERT_WEBHOOK_URL')) {
      this.alertChannels.push({
        type: 'WEBHOOK',
        config: {
          url: this.configService.get('ALERT_WEBHOOK_URL'),
          headers: this.configService.get('ALERT_WEBHOOK_HEADERS') || {},
        },
        enabled: true,
      });
    }
  }

  async sendAlert(threat: SecurityThreat): Promise<void> {
    // Only send alerts for HIGH and CRITICAL threats
    if (!['HIGH', 'CRITICAL'].includes(threat.severity)) {
      return;
    }

    const alertMessage = this.formatAlertMessage(threat);

    for (const channel of this.alertChannels) {
      if (channel.enabled) {
        try {
          await this.sendToChannel(channel, alertMessage, threat);
        } catch (error) {
          console.error(`Failed to send alert to ${channel.type}:`, error);
        }
      }
    }
  }

  private async sendToChannel(channel: AlertChannel, message: string, threat: SecurityThreat): Promise<void> {
    switch (channel.type) {
      case 'EMAIL':
        await this.sendEmailAlert(channel.config, message, threat);
        break;
      case 'SLACK':
        await this.sendSlackAlert(channel.config, message, threat);
        break;
      case 'WEBHOOK':
        await this.sendWebhookAlert(channel.config, message, threat);
        break;
      case 'SMS':
        await this.sendSmsAlert(channel.config, message, threat);
        break;
    }
  }

  private async sendEmailAlert(config: any, message: string, threat: SecurityThreat): Promise<void> {
    // In production, use a proper email service like SendGrid, AWS SES, etc.
    console.log(`EMAIL ALERT to ${config.to}:`, message);
  }

  private async sendSlackAlert(config: any, message: string, threat: SecurityThreat): Promise<void> {
    const slackMessage = {
      channel: config.channel,
      text: message,
      attachments: [{
        color: this.getSeverityColor(threat.severity),
        fields: [
          { title: 'Threat Type', value: threat.type, short: true },
          { title: 'Severity', value: threat.severity, short: true },
          { title: 'IP Address', value: threat.ip, short: true },
          { title: 'Timestamp', value: threat.timestamp.toISOString(), short: true },
        ],
      }],
    };

    // In production, send HTTP POST to Slack webhook
    console.log(`SLACK ALERT:`, slackMessage);
  }

  private async sendWebhookAlert(config: any, message: string, threat: SecurityThreat): Promise<void> {
    const webhookPayload = {
      alert: message,
      threat,
      timestamp: new Date().toISOString(),
    };

    // In production, send HTTP POST to webhook URL
    console.log(`WEBHOOK ALERT to ${config.url}:`, webhookPayload);
  }

  private async sendSmsAlert(config: any, message: string, threat: SecurityThreat): Promise<void> {
    // In production, use SMS service like Twilio
    console.log(`SMS ALERT to ${config.phoneNumber}:`, message);
  }

  private formatAlertMessage(threat: SecurityThreat): string {
    return `🚨 SECURITY ALERT - ${threat.severity}
    
Threat Type: ${threat.type}
Description: ${threat.description}
IP Address: ${threat.ip}
Time: ${threat.timestamp.toISOString()}
${threat.userId ? `User ID: ${threat.userId}` : ''}

Please investigate immediately.`;
  }

  private getSeverityColor(severity: string): string {
    const colors = {
      CRITICAL: 'danger',
      HIGH: 'warning',
      MEDIUM: 'good',
      LOW: '#439FE0',
    };
    return colors[severity] || '#439FE0';
  }

  async testAlerts(): Promise<void> {
    const testThreat: SecurityThreat = {
      id: 'test-threat',
      type: 'BRUTE_FORCE',
      severity: 'HIGH',
      description: 'Test security alert',
      ip: '192.168.1.100',
      timestamp: new Date(),
      metadata: { test: true },
    };

    await this.sendAlert(testThreat);
  }
}

// advancedSecurity/security-monitoring/security-monitoring.controller.ts
import { Controller, Get, Post, Query } from '@nestjs/common';
import { SecurityMonitoringService, SecurityMetrics, SecurityThreat } from './security-monitoring.service';
import { SecurityAlertsService } from './security-alerts.service';

@Controller('security-monitoring')
export class SecurityMonitoringController {
  constructor(
    private securityMonitoringService: SecurityMonitoringService,
    private securityAlertsService: SecurityAlertsService
  ) {}

  @Get('dashboard')
  async getDashboard(): Promise<any> {
    return this.securityMonitoringService.getDashboardData();
  }

  @Get('metrics')
  async getMetrics(@Query('hours') hours?: string): Promise<SecurityMetrics[]> {
    const hoursNum = hours ? parseInt(hours) : 24;
    return this.securityMonitoringService.getSecurityMetrics(hoursNum);
  }

  @Get('threats')
  async getThreats(@Query('severity') severity?: string): Promise<SecurityThreat[]> {
    return this.securityMonitoringService.getThreats(severity);
  }

  @Post('test-alerts')
  async testAlerts(): Promise<{ message: string }> {
    await this.securityAlertsService.testAlerts();
    return { message: 'Test alerts sent successfully' };
  }
}

// advancedSecurity/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// advancedSecurity/decorators/encrypted-field.decorator.ts
import { Transform } from 'class-transformer';

export function EncryptedField() {
  return Transform(({ value, obj, type }) => {
    // This would integrate with the EncryptionService
    // For demonstration purposes, returning as-is
    return value;
  });
}

// advancedSecurity/decorators/audit-log.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const AUDIT_LOG_KEY = 'auditLog';
export const AuditLog = (action: string, resource: string) => 
  SetMetadata(AUDIT_LOG_KEY, { action, resource });

// advancedSecurity/guards/rate-limit.guard.ts
import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private requests = new Map<string, { count: number; resetTime: number }>();
  private readonly limit = 100; // requests per window
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const key = this.getKey(request);
    const now = Date.now();
    
    const requestData = this.requests.get(key);
    
    if (!requestData || now > requestData.resetTime) {
      this.requests.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (requestData.count >= this.limit) {
      throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }
    
    requestData.count++;
    return true;
  }

  private getKey(request: any): string {
    // Use IP address and user ID if available
    return `${request.ip}_${request.user?.id || 'anonymous'}`;
  }
}

// advancedSecurity/filters/security-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AuditService } from '../audit/audit.service';

@Catch()
export class SecurityExceptionFilter implements ExceptionFilter {
  constructor(private auditService: AuditService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException 
      ? exception.getStatus() 
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException 
      ? exception.getResponse() 
      : 'Internal server error';

    // Log security-related exceptions
    if (this.isSecurityException(status, exception)) {
      this.auditService.logActivity({
        action: 'SECURITY_EXCEPTION',
        resource: request.url,
        method: request.method,
        url: request.url,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        userId: request.user?.id,
        statusCode: status,
        metadata: {
          exception: exception instanceof Error ? exception.message : 'Unknown error',
          stack: exception instanceof Error ? exception.stack : undefined,
        },
      });
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'string' ? message : (message as any)?.message || 'An error occurred',
    });
  }

  private isSecurityException(status: number, exception: unknown): boolean {
    const securityStatuses = [401, 403, 429];
    const securityKeywords = ['unauthorized', 'forbidden', 'rate limit', 'signature', 'authentication'];
    
    if (securityStatuses.includes(status)) {
      return true;
    }

    const exceptionString = exception instanceof Error ? exception.message.toLowerCase() : '';
    return securityKeywords.some(keyword => exceptionString.includes(keyword));
  }
}

// advancedSecurity/middleware/security-headers.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Content Security Policy
    res.setHeader('Content-Security-Policy', [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '));

    // Remove server information
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');

    next();
  }
}

// advancedSecurity/types/security.types.ts
export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
}

export interface ApiSigningConfig {
  secretKey: string;
  algorithm: string;
  timestampTolerance: number;
}

export interface SecurityConfig {
  encryption: EncryptionConfig;
  apiSigning: ApiSigningConfig;
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  audit: {
    enabled: boolean;
    maxLogs: number;
    externalUrl?: string;
  };
  monitoring: {
    enabled: boolean;
    alertThresholds: {
      failedLogins: number;
      requestsPerMinute: number;
      errorRate: number;
    };
  };
}

// advancedSecurity/config/security.config.ts
import { SecurityConfig } from '../types/security.types';

export const securityConfig: SecurityConfig = {
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
  },
  apiSigning: {
    secretKey: process.env.API_SECRET_KEY || 'default-secret-key',
    algorithm: 'sha256',
    timestampTolerance: 300000, // 5 minutes
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  audit: {
    enabled: true,
    maxLogs: 10000,
    externalUrl: process.env.AUDIT_WEBHOOK_URL,
  },
  monitoring: {
    enabled: true,
    alertThresholds: {
      failedLogins: 10,
      requestsPerMinute: 1000,
      errorRate: 0.05, // 5%
    },
  },
};

// advancedSecurity/utils/crypto.utils.ts
import * as crypto from 'crypto';

export class CryptoUtils {
  static generateSecureRandom(length: number): string {
    return crypto.randomBytes(length).toString('hex');
  }

  static hashWithSalt(data: string, salt?: string): { hash: string; salt: string } {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(data, actualSalt, 10000, 64, 'sha512').toString('hex');
    return { hash, salt: actualSalt };
  }

  static verifyHash(data: string, hash: string, salt: string): boolean {
    const verifyHash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
  }

  static generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    return { publicKey, privateKey };
  }

  static signData(data: string, privateKey: string): string {
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    return sign.sign(privateKey, 'hex');
  }

  static verifySignature(data: string, signature: string, publicKey: string): boolean {
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    return verify.verify(publicKey, signature, 'hex');
  }
}