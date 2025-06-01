import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, In, Between } from 'typeorm';
import { InventoryMovement, MovementType, MovementStatus, MovementPriority } from './inventory-movement.entity';
import { StockLevel } from './stock-level.entity';
import { StockReservation } from './stock-reservation.entity';
import { StockAlert, AlertType, AlertStatus } from './stock-alert.entity';
import { BatchTracking } from './batch-tracking.entity';
import { CreateMovementDto, TransferStockDto, BulkMovementDto, ReserveStockDto, UpdateStockLevelsDto } from './inventory-movement.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class InventoryMovementService {
  constructor(
    @InjectRepository(InventoryMovement)
    private movementRepository: Repository<InventoryMovement>,
    @InjectRepository(StockLevel)
    private stockLevelRepository: Repository<StockLevel>,
    @InjectRepository(StockReservation)
    private reservationRepository: Repository<StockReservation>,
    @InjectRepository(StockAlert)
    private alertRepository: Repository<StockAlert>,
    @InjectRepository(BatchTracking)
    private batchRepository: Repository<BatchTracking>,
    private dataSource: DataSource,
  ) {}

  // Enhanced stock operations with approval workflow
  async createMovementRequest(dto: CreateMovementDto): Promise<InventoryMovement> {
    const movement = this.movementRepository.create({
      ...dto,
      referenceNumber: dto.referenceNumber || this.generateReferenceNumber(),
      status: dto.priority === MovementPriority.URGENT ? MovementStatus.APPROVED : MovementStatus.PENDING
    });

    const savedMovement = await this.movementRepository.save(movement);
    
    if (dto.priority === MovementPriority.URGENT) {
      return this.processMovement(savedMovement.id);
    }

    return savedMovement;
  }

  async approveMovement(movementId: string, approvedBy: string): Promise<InventoryMovement> {
    const movement = await this.movementRepository.findOne({ where: { id: movementId } });
    
    if (!movement) {
      throw new NotFoundException('Movement not found');
    }

    if (movement.status !== MovementStatus.PENDING) {
      throw new BadRequestException('Only pending movements can be approved');
    }

    movement.status = MovementStatus.APPROVED;
    movement.approvedBy = approvedBy;
    movement.approvedAt = new Date();

    return this.movementRepository.save(movement);
  }

  async rejectMovement(movementId: string, rejectedBy: string, reason: string): Promise<InventoryMovement> {
    const movement = await this.movementRepository.findOne({ where: { id: movementId } });
    
    if (!movement) {
      throw new NotFoundException('Movement not found');
    }

    movement.status = MovementStatus.REJECTED;
    movement.approvedBy = rejectedBy;
    movement.approvedAt = new Date();
    movement.notes = `Rejected: ${reason}`;

    return this.movementRepository.save(movement);
  }

  async processMovement(movementId: string): Promise<InventoryMovement> {
    const movement = await this.movementRepository.findOne({ where: { id: movementId } });
    
    if (!movement) {
      throw new NotFoundException('Movement not found');
    }

    if (movement.status !== MovementStatus.APPROVED) {
      throw new BadRequestException('Movement must be approved before processing');
    }

    movement.status = MovementStatus.IN_PROGRESS;
    await this.movementRepository.save(movement);

    try {
      switch (movement.type) {
        case MovementType.STOCK_IN:
          return this.stockIn(movement);
        case MovementType.STOCK_OUT:
          return this.stockOut(movement);
        case MovementType.TRANSFER:
          return this.executeTransfer(movement);
        case MovementType.ADJUSTMENT:
          return this.executeAdjustment(movement);
      }
    } catch (error) {
      movement.status = MovementStatus.FAILED;
      movement.notes = `Failed: ${error.message}`;
      await this.movementRepository.save(movement);
      throw error;
    }
  }

  // Bulk operations
  async bulkMovements(dto: BulkMovementDto): Promise<InventoryMovement[]> {
    if (dto.atomicOperation) {
      return this.atomicBulkMovements(dto);
    }

    const results = [];
    for (const movementDto of dto.movements) {
      try {
        const movement = await this.createMovementRequest(movementDto);
        results.push(movement);
      } catch (error) {
        results.push({ error: error.message, movement: movementDto });
      }
    }
    return results;
  }

  private async atomicBulkMovements(dto: BulkMovementDto): Promise<InventoryMovement[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const movements = [];
      for (const movementDto of dto.movements) {
        const movement = queryRunner.manager.create(InventoryMovement, {
          ...movementDto,
          referenceNumber: movementDto.referenceNumber || this.generateReferenceNumber(),
          status: MovementStatus.PENDING
        });
        movements.push(await queryRunner.manager.save(movement));
      }

      await queryRunner.commitTransaction();
      return movements;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Stock reservation system
  async reserveStock(dto: ReserveStockDto): Promise<StockReservation> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.validateStockAvailability(dto.productId, dto.locationId, dto.quantity, queryRunner);

      const reservation = queryRunner.manager.create(StockReservation, {
        ...dto,
        expiresAt: dto.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours default
      });

      const savedReservation = await queryRunner.manager.save(reservation);

      // Update stock level reserved quantity
      const stockLevel = await this.getStockLevel(dto.productId, dto.locationId, queryRunner);
      stockLevel.reservedQuantity += dto.quantity;
      stockLevel.availableQuantity = stockLevel.quantity - stockLevel.reservedQuantity;
      await queryRunner.manager.save(stockLevel);

      await queryRunner.commitTransaction();
      return savedReservation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async releaseReservation(reservationId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const reservation = await queryRunner.manager.findOne(StockReservation, {
        where: { id: reservationId, isActive: true }
      });

      if (!reservation) {
        throw new NotFoundException('Active reservation not found');
      }

      reservation.isActive = false;
      await queryRunner.manager.save(reservation);

      // Update stock level
      const stockLevel = await this.getStockLevel(reservation.productId, reservation.locationId, queryRunner);
      stockLevel.reservedQuantity -= reservation.quantity;
      stockLevel.availableQuantity = stockLevel.quantity - stockLevel.reservedQuantity;
      await queryRunner.manager.save(stockLevel);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Advanced stock level management
  async updateStockLevels(dto: UpdateStockLevelsDto): Promise<StockLevel> {
    const stockLevel = await this.getStockLevel(dto.productId, dto.locationId);
    
    if (dto.minStockLevel !== undefined) stockLevel.minStockLevel = dto.minStockLevel;
    if (dto.maxStockLevel !== undefined) stockLevel.maxStockLevel = dto.maxStockLevel;
    if (dto.reorderPoint !== undefined) stockLevel.reorderPoint = dto.reorderPoint;

    await this.checkStockAlerts(stockLevel);
    
    return this.stockLevelRepository.save(stockLevel);
  }

  async getStockValuation(locationId?: string): Promise<any> {
    const query = this.stockLevelRepository.createQueryBuilder('stock')
      .select([
        'stock.productId',
        'stock.locationId', 
        'stock.quantity',
        'stock.averageCost',
        '(stock.quantity * COALESCE(stock.averageCost, 0)) as totalValue'
      ]);

    if (locationId) {
      query.where('stock.locationId = :locationId', { locationId });
    }

    const results = await query.getRawMany();
    
    const totalValue = results.reduce((sum, item) => sum + parseFloat(item.totalValue || 0), 0);
    
    return {
      totalValue,
      breakdown: results,
      locationCount: new Set(results.map(r => r.locationId)).size,
      productCount: results.length
    };
  }

  // Batch tracking
  async createBatch(
    productId: string,
    locationId: string,
    batchNumber: string,
    quantity: number,
    options: {
      manufacturedDate?: Date;
      expiryDate?: Date;
      supplierId?: string;
      unitCost?: number;
    } = {}
  ): Promise<BatchTracking> {
    const batch = this.batchRepository.create({
      productId,
      locationId,
      batchNumber,
      quantity,
      ...options
    });

    return this.batchRepository.save(batch);
  }

  async getBatchesByProduct(productId: string, locationId?: string): Promise<BatchTracking[]> {
    const where: any = { productId, isActive: true };
    if (locationId) where.locationId = locationId;

    return this.batchRepository.find({
      where,
      order: { expiryDate: 'ASC' }
    });
  }

  async getExpiringBatches(days = 30): Promise<BatchTracking[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.batchRepository.find({
      where: {
        expiryDate: Between(new Date(), futureDate),
        isActive: true
      },
      order: { expiryDate: 'ASC' }
    });
  }

  // Analytics and reporting
  async getMovementAnalytics(
    startDate: Date,
    endDate: Date,
    productId?: string,
    locationId?: string
  ): Promise<any> {
    const query = this.movementRepository.createQueryBuilder('movement')
      .where('movement.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('movement.status = :status', { status: MovementStatus.COMPLETED });

    if (productId) query.andWhere('movement.productId = :productId', { productId });
    if (locationId) {
      query.andWhere('(movement.fromLocationId = :locationId OR movement.toLocationId = :locationId)', { locationId });
    }

    const movements = await query.getMany();

    const analytics = {
      totalMovements: movements.length,
      stockIn: movements.filter(m => m.type === MovementType.STOCK_IN).length,
      stockOut: movements.filter(m => m.type === MovementType.STOCK_OUT).length,
      transfers: movements.filter(m => m.type === MovementType.TRANSFER).length,
      adjustments: movements.filter(m =>