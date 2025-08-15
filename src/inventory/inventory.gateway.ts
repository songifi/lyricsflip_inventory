import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ConnectionManagerService } from './connection-manager.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/inventory',
})
export class InventoryGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(InventoryGateway.name);

  constructor(private readonly connectionManager: ConnectionManagerService) {}

  handleConnection(client: Socket) {
    if (!this.connectionManager.addClient(client)) {
      client.emit('connection-rejected', { reason: 'Max connections reached' });
      client.disconnect();
      return;
    }
    
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connected', { message: 'Connected to inventory updates' });
  }

  handleDisconnect(client: Socket) {
    this.connectionManager.removeClient(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe-to-stock')
  handleSubscribeToStock(
    @MessageBody() data: { sku?: string; location?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = data.sku ? `stock-${data.sku}` : 'stock-all';
    client.join(room);
    this.connectionManager.addSubscription(client.id, room);
    this.logger.log(`Client ${client.id} subscribed to ${room}`);
    return { event: 'subscribed', data: { room } };
  }

  @SubscribeMessage('unsubscribe-from-stock')
  handleUnsubscribeFromStock(
    @MessageBody() data: { sku?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = data.sku ? `stock-${data.sku}` : 'stock-all';
    client.leave(room);
    this.connectionManager.removeSubscription(client.id, room);
    this.logger.log(`Client ${client.id} unsubscribed from ${room}`);
    return { event: 'unsubscribed', data: { room } };
  }

  // Emit stock level updates
  emitStockUpdate(data: {
    sku: string;
    locationId: string;
    quantity: number;
    previousQuantity: number;
    change: number;
  }) {
    this.server.to(`stock-${data.sku}`).emit('stock-updated', data);
    this.server.to('stock-all').emit('stock-updated', data);
  }

  // Emit low stock alerts
  emitLowStockAlert(data: {
    sku: string;
    locationId: string;
    currentQuantity: number;
    threshold: number;
  }) {
    this.server.emit('low-stock-alert', data);
  }

  // Emit inventory movement notifications
  emitInventoryMovement(data: {
    sku: string;
    fromLocation: string;
    toLocation: string;
    quantity: number;
    timestamp: Date;
  }) {
    this.server.to(`stock-${data.sku}`).emit('inventory-movement', data);
    this.server.to('stock-all').emit('inventory-movement', data);
  }

  // Get connection statistics
  getConnectionStats() {
    return this.connectionManager.getConnectionStats();
  }
}