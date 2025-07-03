import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: '/inventory', cors: true })
export class InventoryGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('InventoryGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Method to emit stock updates to all clients
  broadcastStockUpdate(update: any) {
    this.server.emit('stockUpdate', update);
  }

  // (Optional) Listen for client messages if needed
  @SubscribeMessage('subscribeToStock')
  handleSubscribe(@MessageBody() data: any) {
    // Handle client subscription logic if needed
    return { event: 'subscribed', data };
  }
} 