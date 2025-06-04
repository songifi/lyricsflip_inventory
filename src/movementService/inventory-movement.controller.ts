import { Controller, Get, Patch, Post, Delete, Body, Param, Query, NotFoundException } from '@nestjs/common';
import { InventoryMovementService } from './inventory-movement.service';
import { BulkMovementDto, ReserveStockDto, UpdateStockLevelsDto } from './entities/inventory-movement.dto';
import { AlertType, AlertStatus } from './entities/inventory-movement.entity';
import { BatchHistory } from './entities/batch-history.entity';

@Controller('inventory-movement')
export class InventoryMovementController {
  constructor(private readonly inventoryService: InventoryMovementService) {}

  @Post('movements/:id/approve')
  async approveMovement(@Param('id') id: string, @Body() body: { approvedBy: string }) {
    return this.inventoryService.approveMovement(id, body.approvedBy);
  }

  @Post('movements/:id/reject')
  async rejectMovement(@Param('id') id: string, @Body() body: { rejectedBy: string; reason: string }) {
    return this.inventoryService.rejectMovement(id, body.rejectedBy, body.reason);
  }

  @Post('movements/:id/process')
  async processMovement(@Param('id') id: string) {
    return this.inventoryService.processMovement(id);
  }

  @Post('movements/bulk')
  async bulkMovements(@Body() dto: BulkMovementDto) {
    return this.inventoryService.bulkMovements(dto);
  }

  @Post('reservations')
  async reserveStock(@Body() dto: ReserveStockDto) {
    return this.inventoryService.reserveStock(dto);
  }

  @Delete('reservations/:id')
  async releaseReservation(@Param('id') id: string) {
    return this.inventoryService.releaseReservation(id);
  }

  @Patch('stock-levels')
  async updateStockLevels(@Body() dto: UpdateStockLevelsDto) {
    return this.inventoryService.updateStockLevels(dto);
  }

  @Get('valuation')
  async getStockValuation(@Query('locationId') locationId?: string) {
    return this.inventoryService.getStockValuation(locationId);
  }

  @Post('batches')
  async createBatch(@Body() body: {
    productId: string;
    locationId: string;
    batchNumber?: string;
    quantity: number;
    manufacturedDate?: Date;
    expiryDate?: Date;
    supplierId?: string;
    unitCost?: number;
  }) {
    return this.inventoryService.createBatch(
      body.productId,
      body.locationId,
      body.batchNumber,
      body.quantity,
      {
        manufacturedDate: body.manufacturedDate,
        expiryDate: body.expiryDate,
        supplierId: body.supplierId,
        unitCost: body.unitCost
      }
    );
  }

  @Get('batches/:batchId/history')
  async getBatchHistory(@Param('batchId') batchId: string) {
    return this.inventoryService['dataSource'].getRepository(BatchHistory).find({
      where: { batchId },
      order: { createdAt: 'ASC' }
    });
  }

  @Get('batches/product/:productId')
  async getBatchesByProduct(
    @Param('productId') productId: string,
    @Query('locationId') locationId?: string
  ) {
    return this.inventoryService.getBatchesByProduct(productId, locationId);
  }

  @Get('batches/expiring')
  async getExpiringBatches(@Query('days') days = 30) {
    return this.inventoryService.getExpiringBatches(+days);
  }

  @Get('analytics/movements')
  async getMovementAnalytics(
    @Query('startDate') startDate: string,
    @Query('days') days = 30
  ) {
    // You may want to add productId and locationId as query params
    return this.inventoryService.getStockMovementTrends(undefined, undefined, +days);
  }

  @Get('analytics/forecast/:productId')
  async forecastStockNeeds(
    @Param('productId') productId: string,
    @Query('locationId') locationId?: string,
    @Query('forecastDays') forecastDays = 30
  ) {
    return this.inventoryService.forecastStockNeeds(productId, locationId, +forecastDays);
  }

  @Get('alerts')
  async getAlerts(
    @Query('type') type?: AlertType,
    @Query('status') status?: AlertStatus,
    @Query('productId') productId?: string,
    @Query('locationId') locationId?: string
  ) {
    const query = this.inventoryService['alertRepository'].createQueryBuilder('alert');
    if (type) query.andWhere('alert.type = :type', { type });
    if (status) query.andWhere('alert.status = :status', { status });
    if (productId) query.andWhere('alert.productId = :productId', { productId });
    if (locationId) query.andWhere('alert.locationId = :locationId', { locationId });
    return query.orderBy('alert.createdAt', 'DESC').getMany();
  }

  @Patch('alerts/:id/acknowledge')
  async acknowledgeAlert(
    @Param('id') id: string,
    @Body() body: { acknowledgedBy: string }
  ) {
    const alert = await this.inventoryService['alertRepository'].findOne({ where: { id } });
    if (!alert) {
      throw new NotFoundException('Alert not found');
    }
    alert.status = AlertStatus.ACKNOWLEDGED;
    alert.acknowledgedBy = body.acknowledgedBy;
    alert.acknowledgedAt = new Date();
    return this.inventoryService['alertRepository'].save(alert);
  }
}
