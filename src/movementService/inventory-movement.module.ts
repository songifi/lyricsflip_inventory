import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryMovementService } from './inventory-movement.service';
import { InventoryMovementController } from './inventory-movement.controller';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { StockLevel } from './entities/stock-level.entity';
import { StockAlert } from './entities/stock-alert.entity';
import { StockReservation } from './entities/stock-reservation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryMovement,
      StockLevel,
      StockAlert,
      StockReservation
    ])
  ],
  controllers: [InventoryMovementController],
  providers: [InventoryMovementService],
  exports: [InventoryMovementService]
})
export class InventoryMovementModule {}
      currentQuantity: stockLevel.quantity,
        thresholdQuantity: stockLevel.reorderPoint
      });
      stockLevel.isLowStock = true;
    }

    // Check for out of stock
    if (stockLevel.quantity <= 0) {
      alerts.push({
        type: AlertType.OUT_OF_STOCK,
        productId: stockLevel.productId,
        locationId: stockLevel.locationId,
        message: `Out of stock alert: Product is completely out of stock`,
        currentQuantity: stockLevel.quantity,
        thresholdQuantity: 0
      });
      stockLevel.isOutOfStock = true;
    }

    // Check for overstock
    if (stockLevel.maxStockLevel > 0 && stockLevel.quantity > stockLevel.maxStockLevel) {
      alerts.push({
        type: AlertType.OVERSTOCK,
        productId: stockLevel.productId,
        locationId: stockLevel.locationId,
        message: `Overstock alert: ${stockLevel.quantity} units exceed maximum level (${stockLevel.maxStockLevel})`,
        currentQuantity: stockLevel.quantity,
        thresholdQuantity: stockLevel.maxStockLevel
      });
    }

    // Save alerts
    for (const alertData of alerts) {
      // Check if alert already exists and is active
      const existingAlert = await this.alertRepository.findOne({
        where: {
          type: alertData.type,
          productId: alertData.productId,
          locationId: alertData.locationId,
          status: AlertStatus.ACTIVE
        }
      });

      if (!existingAlert) {
        const alert = this.alertRepository.create(alertData);
        await this.alertRepository.save(alert);
      }
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async checkExpiringBatches(): Promise<void> {
    const expiringBatches = await this.getExpiringBatches(7); // 7 days warning

    for (const batch of expiringBatches) {
      const existingAlert = await this.alertRepository.findOne({
        where: {
          type: AlertType.EXPIRY_WARNING,
          productId: batch.productId,
          locationId: batch.locationId,
          status: AlertStatus.ACTIVE
        }
      });

      if (!existingAlert) {
        const alert = this.alertRepository.create({
          type: AlertType.EXPIRY_WARNING,
          productId: batch.productId,
          locationId: batch.locationId,
          message: `Batch ${batch.batchNumber} expires on ${batch.expiryDate?.toDateString()}`,
          currentQuantity: batch.quantity
        });
        await this.alertRepository.save(alert);
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredReservations(): Promise<void> {
    const expiredReservations = await this.reservationRepository.find({
      where: {
        expiresAt: Between(new Date('1900-01-01'), new Date()),
        isActive: true
      }
    });

    for (const reservation of expiredReservations) {
      await this.releaseReservation(reservation.id);
    }
  }

  // Advanced stock operations
  async getStockMovementTrends(
    productId: string,
    locationId?: string,
    days = 30
  ): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const query = this.movementRepository.createQueryBuilder('movement')
      .where('movement.productId = :productId', { productId })
      .andWhere('movement.createdAt >= :startDate', { startDate })
      .andWhere('movement.status = :status', { status: MovementStatus.COMPLETED });

    if (locationId) {
      query.andWhere('(movement.fromLocationId = :locationId OR movement.toLocationId = :locationId)', { locationId });
    }

    const movements = await query.orderBy('movement.createdAt', 'ASC').getMany();

    const dailyTrends = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= new Date()) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayMovements = movements.filter(m => 
        m.createdAt.toISOString().split('T')[0] === dateStr
      );

      const stockIn = dayMovements
        .filter(m => m.type === MovementType.STOCK_IN)
        .reduce((sum, m) => sum + Number(m.quantity), 0);

      const stockOut = dayMovements
        .filter(m => m.type === MovementType.STOCK_OUT)
        .reduce((sum, m) => sum + Number(m.quantity), 0);

      dailyTrends.push({
        date: dateStr,
        stockIn,
        stockOut,
        netChange: stockIn - stockOut,
        movementCount: dayMovements.length
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      trends: dailyTrends,
      summary: {
        totalStockIn: dailyTrends.reduce((sum, day) => sum + day.stockIn, 0),
        totalStockOut: dailyTrends.reduce((sum, day) => sum + day.stockOut, 0),
        averageDailyChange: dailyTrends.reduce((sum, day) => sum + day.netChange, 0) / dailyTrends.length,
        mostActiveDay: dailyTrends.reduce((max, day) => day.movementCount > max.movementCount ? day : max, dailyTrends[0])
      }
    };
  }

  async forecastStockNeeds(
    productId: string,
    locationId?: string,
    forecastDays = 30
  ): Promise<any> {
    const historicalDays = 90;
    const trends = await this.getStockMovementTrends(productId, locationId, historicalDays);
    
    const avgDailyConsumption = Math.abs(trends.summary.totalStockOut / historicalDays);
    const currentStock = await this.getStockLevels(productId, locationId);
    const stockLevel = currentStock[0];

    if (!stockLevel) {
      return {
        forecast: 'No stock data available',
        daysUntilStockout: 0,
        recommendedOrder: 0
      };
    }

    return {
      forecastedConsumption,
      recommendedOrder,
      forecast: daysUntilStockout < forecastDays 
        ? `Stock will run out in ${daysUntilStockout} days. Recommend ordering ${Math.ceil(recommendedOrder)} units.`
        : `Stock sufficient for ${forecastDays} days.`
    };
  

  // Complete missing methods
  // ...
  // (All other service methods remain inside this class)

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.updateStockLevel(
        movement.productId,
        movement.toLocationId!,
        movement.quantity,
        'ADD',
        queryRunner,
        movement.unitCost
      );

      movement.status = MovementStatus.COMPLETED;
      movement.completedAt = new Date();
      const result = await queryRunner.manager.save(movement);
      
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async stockOut(movement: InventoryMovement): Promise<InventoryMovement> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.validateStockAvailability(
        movement.productId,
        movement.fromLocationId!,
        movement.quantity,
        queryRunner
      );

      await this.updateStockLevel(
        movement.productId,
        movement.fromLocationId!,
        movement.quantity,
        'SUBTRACT',
        queryRunner
      );

      movement.status = MovementStatus.COMPLETED;
      movement.completedAt = new Date();
      const result = await queryRunner.manager.save(movement);
      
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async executeTransfer(movement: InventoryMovement): Promise<InventoryMovement> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.validateStockAvailability(
        movement.productId,
        movement.fromLocationId!,
        movement.quantity,
        queryRunner
      );

      await this.updateStockLevel(
        movement.productId,
        movement.fromLocationId!,
        movement.quantity,
        'SUBTRACT',
        queryRunner
      );

      await this.updateStockLevel(
        movement.productId,
        movement.toLocationId!,
        movement.quantity,
        'ADD',
        queryRunner
      );

      movement.status = MovementStatus.COMPLETED;
      movement.completedAt = new Date();
      const result = await queryRunner.manager.save(movement);
      
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async executeAdjustment(movement: InventoryMovement): Promise<InventoryMovement> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const locationId = movement.fromLocationId || movement.toLocationId!;
      const stockLevel = await this.getStockLevel(movement.productId, locationId, queryRunner);
      
      // Calculate the adjustment based on movement type
      let newQuantity: number;
      if (movement.fromLocationId) {
        // Negative adjustment
        newQuantity = stockLevel.quantity - movement.quantity;
      } else {
        // Positive adjustment
        newQuantity = stockLevel.quantity + movement.quantity;
      }

      if (newQuantity < 0) {
        throw new ConflictException('Adjustment would result in negative stock');
      }

      stockLevel.quantity = newQuantity;
      stockLevel.availableQuantity = newQuantity - stockLevel.reservedQuantity;
      await queryRunner.manager.save(stockLevel);

      await this.checkStockAlerts(stockLevel);

      movement.status = MovementStatus.COMPLETED;
      movement.completedAt = new Date();
      const result = await queryRunner.manager.save(movement);
      
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async validateStockAvailability(
    productId: string,
    locationId: string,
    quantity: number,
    queryRunner: QueryRunner
  ): Promise<void> {
    const stockLevel = await this.getStockLevel(productId, locationId, queryRunner);
    
    if (stockLevel.availableQuantity < quantity) {
      throw new ConflictException(
        `Insufficient stock. Available: ${stockLevel.availableQuantity}, Required: ${quantity}`
      );
    }
  }

  private async getStockLevel(
    productId: string,
    locationId: string,
    queryRunner?: QueryRunner
  ): Promise<StockLevel> {
    const manager = queryRunner ? queryRunner.manager : this.stockLevelRepository.manager;
    
    let stockLevel = await manager.findOne(StockLevel, {
      where: { productId, locationId }
    });

    if (!stockLevel) {
      stockLevel = manager.create(StockLevel, {
        productId,
        locationId,
        quantity: 0,
        reservedQuantity: 0,
        availableQuantity: 0,
        minStockLevel: 0,
        maxStockLevel: 0,
        reorderPoint: 0
      });
      stockLevel = await manager.save(stockLevel);
    }

    return stockLevel;
  }

  private async updateStockLevel(
    productId: string,
    locationId: string,
    quantity: number,
    operation: 'ADD' | 'SUBTRACT',
    queryRunner: QueryRunner,
    unitCost?: number
  ): Promise<void> {
    const stockLevel = await this.getStockLevel(productId, locationId, queryRunner);

    if (operation === 'ADD') {
      const oldQuantity = stockLevel.quantity;
      stockLevel.quantity += quantity;
      
      // Update average cost using weighted average
      if (unitCost && stockLevel.quantity > 0) {
        const totalValue = (stockLevel.averageCost || 0) * oldQuantity + unitCost * quantity;
        stockLevel.averageCost = totalValue / stockLevel.quantity;
      }
      stockLevel.lastCost = unitCost || stockLevel.lastCost;
    } else {
      stockLevel.quantity -= quantity;
      
      if (stockLevel.quantity < 0) {
        throw new ConflictException('Stock level cannot be negative');
      }
    }

    stockLevel.availableQuantity = stockLevel.quantity - stockLevel.reservedQuantity;
    await queryRunner.manager.save(stockLevel);
    
    // Check for alerts after stock level update
    await this.checkStockAlerts(stockLevel);
  }

  private generateReferenceNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `INV-${timestamp.slice(-8)}-${random}`;
  }
}

  constructor(private readonly inventoryService: InventoryMovementService) {}

  // Movement approval endpoints
  @Patch('movements/:id/approve')
  async approveMovement(
    @Param('id') id: string,
    @Body() body: { approvedBy: string }
  ) {
    return this.inventoryService.approveMovement(id, body.approvedBy);
  }

  @Patch('movements/:id/reject')
  async rejectMovement(
    @Param('id') id: string,
    @Body() body: { rejectedBy: string; reason: string }
  ) {
    return this.inventoryService.rejectMovement(id, body.rejectedBy, body.reason);
  }

  @Post('movements/:id/process')
  async processMovement(@Param('id') id: string) {
    return this.inventoryService.processMovement(id);
  }

  // Bulk operations
  @Post('movements/bulk')
  async bulkMovements(@Body() dto: BulkMovementDto) {
    return this.inventoryService.bulkMovements(dto);
  }

  // Stock reservations
  @Post('reservations')
  async reserveStock(@Body() dto: ReserveStockDto) {
    return this.inventoryService.reserveStock(dto);
  }

  @Delete('reservations/:id')
  async releaseReservation(@Param('id') id: string) {
    return this.inventoryService.releaseReservation(id);
  }

  // Stock level management
  @Patch('stock-levels')
  async updateStockLevels(@Body() dto: UpdateStockLevelsDto) {
    return this.inventoryService.updateStockLevels(dto);
  }

  @Get('valuation')
  async getStockValuation(@Query('locationId') locationId?: string) {
    return this.inventoryService.getStockValuation(locationId);
  }

  // Batch tracking
  @Post('batches')
  async createBatch(@Body() body: {
    productId: string;
    locationId: string;
    batchNumber?: string; // Optional for auto-generation
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

  /**
   * Get audit/history for a batch
   */
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

  // Analytics and reporting
  @Get('analytics/movements')
  async getMovementAnalytics(
    @Query('startDate') startDate: string,
    @Query('days') days = 30
  ) {
    return this.inventoryService.getStockMovementTrends(productId, locationId, +days);
  }

  @Get('analytics/forecast/:productId')
  async forecastStockNeeds(
    @Param('productId') productId: string,
    @Query('locationId') locationId?: string,
    @Query('forecastDays') forecastDays = 30
  ) {
    return this.inventoryService.forecastStockNeeds(productId, locationId, +forecastDays);
  }

  // Alert management
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