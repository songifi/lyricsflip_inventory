import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConnectionManagerService } from '../connection-manager.service';

@Injectable()
export class ConnectionCleanupTask {
  private readonly logger = new Logger(ConnectionCleanupTask.name);

  constructor(private readonly connectionManager: ConnectionManagerService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async cleanupInactiveConnections() {
    this.logger.log('Running connection cleanup task');
    const cleanedUp = this.connectionManager.cleanupInactiveConnections();
    
    if (cleanedUp.length > 0) {
      this.logger.log(`Cleaned up ${cleanedUp.length} inactive connections`);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async logConnectionStats() {
    const stats = this.connectionManager.getConnectionStats();
    this.logger.log(`Connection Stats: ${JSON.stringify(stats)}`);
  }
}