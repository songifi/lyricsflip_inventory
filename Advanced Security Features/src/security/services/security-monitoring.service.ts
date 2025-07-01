import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface SecurityAlert {
  id: string;
  type:
    | "BRUTE_FORCE"
    | "SUSPICIOUS_ACTIVITY"
    | "RATE_LIMIT"
    | "UNAUTHORIZED_ACCESS";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  timestamp: Date;
  ip: string;
  userId?: string;
  metadata?: any;
}

@Injectable()
export class SecurityMonitoringService {
  private readonly alertThresholds = {
    bruteForce: 5, // attempts per minute
    rateLimitPerMinute: 100,
    rateLimitPerHour: 1000,
  };

  private readonly requestCounts = new Map<string, number[]>();
  private readonly failedAttempts = new Map<string, number[]>();
  private readonly alerts: SecurityAlert[] = [];

  constructor(private configService: ConfigService) {}

  // Monitor for brute force attacks
  checkBruteForce(ip: string, userId?: string): boolean {
    const key = `${ip}:${userId || "anonymous"}`;
    const now = Date.now();
    const attempts = this.failedAttempts.get(key) || [];

    // Remove attempts older than 1 minute
    const recentAttempts = attempts.filter((time) => now - time < 60000);

    if (recentAttempts.length >= this.alertThresholds.bruteForce) {
      this.createAlert({
        type: "BRUTE_FORCE",
        severity: "HIGH",
        message: `Brute force attack detected from ${ip}`,
        ip,
        userId,
        metadata: { attempts: recentAttempts.length },
      });
      return true;
    }

    return false;
  }

  // Record failed login attempt
  recordFailedAttempt(ip: string, userId?: string): void {
    const key = `${ip}:${userId || "anonymous"}`;
    const attempts = this.failedAttempts.get(key) || [];
    attempts.push(Date.now());
    this.failedAttempts.set(key, attempts);
  }

  // Check rate limiting
  checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const requests = this.requestCounts.get(ip) || [];

    // Remove requests older than 1 hour
    const recentRequests = requests.filter((time) => now - time < 3600000);
    const lastMinuteRequests = recentRequests.filter(
      (time) => now - time < 60000
    );

    if (lastMinuteRequests.length >= this.alertThresholds.rateLimitPerMinute) {
      this.createAlert({
        type: "RATE_LIMIT",
        severity: "MEDIUM",
        message: `Rate limit exceeded for ${ip}`,
        ip,
        metadata: { requestsPerMinute: lastMinuteRequests.length },
      });
      return true;
    }

    if (recentRequests.length >= this.alertThresholds.rateLimitPerHour) {
      this.createAlert({
        type: "RATE_LIMIT",
        severity: "HIGH",
        message: `Hourly rate limit exceeded for ${ip}`,
        ip,
        metadata: { requestsPerHour: recentRequests.length },
      });
      return true;
    }

    return false;
  }

  // Record request
  recordRequest(ip: string): void {
    const requests = this.requestCounts.get(ip) || [];
    requests.push(Date.now());
    this.requestCounts.set(ip, requests);
  }

  // Detect suspicious activity
  detectSuspiciousActivity(
    ip: string,
    userAgent: string,
    url: string
  ): boolean {
    const suspiciousPatterns = [
      /\b(union|select|insert|delete|drop|script|javascript|vbscript)\b/i,
      /[<>'"]/,
      /\.\./,
    ];

    const isSuspicious = suspiciousPatterns.some(
      (pattern) => pattern.test(url) || pattern.test(userAgent)
    );

    if (isSuspicious) {
      this.createAlert({
        type: "SUSPICIOUS_ACTIVITY",
        severity: "HIGH",
        message: `Suspicious activity detected from ${ip}`,
        ip,
        metadata: { userAgent, url },
      });
    }

    return isSuspicious;
  }

  // Create security alert
  private createAlert(
    alertData: Omit<SecurityAlert, "id" | "timestamp">
  ): void {
    const alert: SecurityAlert = {
      id: this.generateId(),
      timestamp: new Date(),
      ...alertData,
    };

    this.alerts.push(alert);
    console.warn("Security Alert:", alert);

    // In production, send to monitoring service
    this.sendToMonitoringService(alert);
  }

  // Get recent alerts
  getAlerts(limit: number = 50): SecurityAlert[] {
    return this.alerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  private async sendToMonitoringService(alert: SecurityAlert): Promise<void> {
    // Implementation would send to external monitoring service
    // e.g., DataDog, New Relic, custom webhook, etc.
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
