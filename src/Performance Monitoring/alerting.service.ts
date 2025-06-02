import { Injectable, Logger } from '@nestjs/common';

export interface Alert {
  type: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details?: any;
  timestamp?: Date;
}

@Injectable()
export class AlertingService {
  private readonly logger = new Logger(AlertingService.name);
  private alerts: Alert[] = [];
  private readonly maxAlerts = 1000;

  async sendAlert(alert: Alert) {
    const fullAlert: Alert = {
      ...alert,
      timestamp: new Date(),
    };

    this.alerts.push(fullAlert);
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(-this.maxAlerts);
    }

    // Log the alert
    this.logger.warn(`ALERT [${alert.severity}]: ${alert.message}`, alert.details);

    // Here you would integrate with your preferred alerting system
    // Examples: Slack, Discord, Email, PagerDuty, etc.
    await this.sendToExternalServices(fullAlert);
  }

  private async sendToExternalServices(alert: Alert) {
    // Example implementations - uncomment and configure as needed
    
    // Slack webhook example
    // if (process.env.SLACK_WEBHOOK_URL) {
    //   try {
    //     await fetch(process.env.SLACK_WEBHOOK_URL, {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({
    //         text: `🚨 ${alert.severity} Alert: ${alert.message}`,
    //         attachments: [{
    //           color: this.getColorForSeverity(alert.severity),
    //           fields: Object.entries(alert.details || {}).map(([key, value]) => ({
    //             title: key,
    //             value: String(value),
    //             short: true,
    //           })),
    //         }],
    //       }),
    //     });
    //   } catch (error) {
    //     this.logger.error('Failed to send Slack alert', error);
    //   }
    // }

    // Email example (using nodemailer)
    // if (alert.severity === 'CRITICAL' || alert.severity === 'HIGH') {
    //   // Send email for high severity alerts
    // }

    // Discord webhook example
    // if (process.env.DISCORD_WEBHOOK_URL) {
    //   // Send to Discord
    // }
  }

  private getColorForSeverity(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return '#FF0000';
      case 'HIGH': return '#FF6600';
      case 'MEDIUM': return '#FFAA00';
      case 'LOW': return '#FFDD00';
      default: return '#808080';
    }
  }

  getRecentAlerts(minutes = 60): Alert[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.alerts.filter(a => a.timestamp >= cutoff);
  }

  getAllAlerts(): Alert[] {
    return [...this.alerts];
  }
}
