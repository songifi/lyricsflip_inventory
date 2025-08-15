import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

interface ClientInfo {
  id: string;
  connectedAt: Date;
  subscriptions: Set<string>;
  lastActivity: Date;
}

@Injectable()
export class ConnectionManagerService {
  private readonly logger = new Logger(ConnectionManagerService.name);
  private clients = new Map<string, ClientInfo>();
  private readonly maxConnections = parseInt(process.env.MAX_WS_CONNECTIONS || '1000');
  private readonly connectionTimeout = parseInt(process.env.WS_CONNECTION_TIMEOUT || '300000'); // 5 minutes

  addClient(socket: Socket): boolean {
    if (this.clients.size >= this.maxConnections) {
      this.logger.warn(`Max connections reached: ${this.maxConnections}`);
      return false;
    }

    const clientInfo: ClientInfo = {
      id: socket.id,
      connectedAt: new Date(),
      subscriptions: new Set(),
      lastActivity: new Date(),
    };

    this.clients.set(socket.id, clientInfo);
    this.logger.log(`Client added: ${socket.id}. Total: ${this.clients.size}`);
    return true;
  }

  removeClient(clientId: string): void {
    this.clients.delete(clientId);
    this.logger.log(`Client removed: ${clientId}. Total: ${this.clients.size}`);
  }

  updateClientActivity(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.lastActivity = new Date();
    }
  }

  addSubscription(clientId: string, subscription: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.subscriptions.add(subscription);
      this.updateClientActivity(clientId);
    }
  }

  removeSubscription(clientId: string, subscription: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.subscriptions.delete(subscription);
      this.updateClientActivity(clientId);
    }
  }

  getConnectionStats() {
    const now = new Date();
    const activeClients = Array.from(this.clients.values()).filter(
      client => now.getTime() - client.lastActivity.getTime() < this.connectionTimeout
    );

    return {
      totalConnections: this.clients.size,
      activeConnections: activeClients.length,
      maxConnections: this.maxConnections,
      subscriptionCounts: this.getSubscriptionCounts(),
      averageConnectionTime: this.getAverageConnectionTime(),
    };
  }

  private getSubscriptionCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    
    this.clients.forEach(client => {
      client.subscriptions.forEach(sub => {
        counts[sub] = (counts[sub] || 0) + 1;
      });
    });

    return counts;
  }

  private getAverageConnectionTime(): number {
    if (this.clients.size === 0) return 0;

    const now = new Date();
    const totalTime = Array.from(this.clients.values()).reduce(
      (sum, client) => sum + (now.getTime() - client.connectedAt.getTime()),
      0
    );

    return totalTime / this.clients.size;
  }

  // Cleanup inactive connections
  cleanupInactiveConnections(): string[] {
    const now = new Date();
    const inactiveClients: string[] = [];

    this.clients.forEach((client, clientId) => {
      if (now.getTime() - client.lastActivity.getTime() > this.connectionTimeout) {
        inactiveClients.push(clientId);
      }
    });

    inactiveClients.forEach(clientId => {
      this.removeClient(clientId);
    });

    if (inactiveClients.length > 0) {
      this.logger.log(`Cleaned up ${inactiveClients.length} inactive connections`);
    }

    return inactiveClients;
  }
}