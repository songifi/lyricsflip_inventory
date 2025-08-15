import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InventoryGateway } from './inventory.gateway';
import { DashboardService } from './dashboard.service';

@ApiTags('WebSocket Management')
@Controller('websocket')
export class WebSocketController {
  constructor(
    private readonly inventoryGateway: InventoryGateway,
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get WebSocket connection statistics' })
  @ApiResponse({ status: 200, description: 'Connection statistics retrieved' })
  getConnectionStats() {
    return this.inventoryGateway.getConnectionStats();
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get current dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics retrieved' })
  async getDashboardStats() {
    return this.dashboardService.getDashboardStats();
  }
}