import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Repository,
  FindManyOptions,
  FindOptionsWhere,
  Between,
  DataSource,
} from "typeorm";
import { StockMovement, MovementType, MovementStatus } from "./stock-movement.entity";
import { CreateStockMovementDto } from "./dto/create-stock-movement.dto";
import { UpdateStockMovementDto } from "./dto/update-stock-movement.dto";
import { StockMovementQueryDto } from "./dto/stock-movement-query.dto";
import { BatchStockMovementDto } from "./dto/batch-movement.dto";
import { StockMovementNotFoundException } from "./exceptions/stock-movement-not-found.exception";
import { InvalidMovementException } from "./exceptions/invalid-movement.exception";
import { InsufficientStockException } from "./exceptions/insufficient-stock.exception";
import { StockLevelService } from "../stock-level/stock-level.service";

export interface PaginatedStockMovements {
  data: StockMovement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MovementSummary {
  totalIn: number;
  totalOut: number;
  totalTransfers: number;
  totalAdjustments: number;
  netMovement: number;
}

@Injectable()
export class StockMovementService {
  private readonly logger = new Logger(StockMovementService.name);

  constructor(
    @InjectRepository(StockMovement)
    private stockMovementRepository: Repository<StockMovement>,
    private dataSource: DataSource,
    private stockLevelService: StockLevelService
  ) {}

  async create(createStockMovementDto: CreateStockMovementDto): Promise<StockMovement> {
    this.logger.log(
      `Creating stock movement for item: ${createStockMovementDto.itemId}`
    );

    this.validateMovementRequest(createStockMovementDto);

    const movement = this.stockMovementRepository.create({
      ...createStockMovementDto,
      expiryDate: createStockMovementDto.expiryDate
        ? new Date(createStockMovementDto.expiryDate)
        : undefined,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (createStockMovementDto.movementType === MovementType.OUT) {
        if (createStockMovementDto.warehouseId) {
          await this.validateStockAvailability(
            createStockMovementDto.itemId,
            createStockMovementDto.quantity,
            createStockMovementDto.warehouseId,
            queryRunner
          );
        }
      }

      const savedMovement = await queryRunner.manager.save(movement);
      
      await this.updateStockLevels(savedMovement, queryRunner);
      
      await queryRunner.commitTransaction();
      
      this.logger.log(`Stock movement created successfully with ID: ${savedMovement.id}`);
      return savedMovement;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create stock movement: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: StockMovementQueryDto): Promise<PaginatedStockMovements> {
    const { page, limit, sortBy, sortOrder, dateFrom, dateTo, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<StockMovement> = {};

    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined) {
        where[key] = filters[key];
      }
    });

    if (dateFrom || dateTo) {
      const fromDate = dateFrom ? new Date(dateFrom) : new Date("1900-01-01");
      const toDate = dateTo ? new Date(dateTo) : new Date("2100-01-01");
      where.createdAt = Between(fromDate, toDate);
    }

    const findOptions: FindManyOptions<StockMovement> = {
      where,
      skip,
      take: limit,
      order: this.buildSortOptions(sortBy || ["createdAt"], sortOrder),
    };

    const [movements, total] = await this.stockMovementRepository.findAndCount(
      findOptions
    );

    return {
      data: movements,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<StockMovement> {
    const movement = await this.stockMovementRepository.findOne({
      where: { id },
    });
    
    if (!movement) {
      throw new StockMovementNotFoundException(id);
    }
    
    return movement;
  }

  async findByItemId(
    itemId: string,
    query: StockMovementQueryDto
  ): Promise<PaginatedStockMovements> {
    return this.findAll({ ...query, itemId });
  }

  async update(
    id: string,
    updateStockMovementDto: UpdateStockMovementDto
  ): Promise<StockMovement> {
    const movement = await this.findOne(id);

    if (movement.status === MovementStatus.COMPLETED) {
      throw new InvalidMovementException("Cannot update completed movement");
    }

    Object.assign(movement, updateStockMovementDto);

    if (updateStockMovementDto.expiryDate) {
      movement.expiryDate = new Date(updateStockMovementDto.expiryDate);
    }

    try {
      const updatedMovement = await this.stockMovementRepository.save(movement);
      this.logger.log(`Stock movement updated successfully with ID: ${id}`);
      return updatedMovement;
    } catch (error) {
      this.logger.error(`Failed to update stock movement ${id}: ${error.message}`);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const movement = await this.findOne(id);

    if (movement.status === MovementStatus.COMPLETED) {
      throw new InvalidMovementException("Cannot delete completed movement");
    }

    try {
      await this.stockMovementRepository.remove(movement);
      this.logger.log(`Stock movement deleted successfully with ID: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete stock movement ${id}: ${error.message}`);
      throw error;
    }
  }

  async approve(id: string, approvedBy: string): Promise<StockMovement> {
    const movement = await this.findOne(id);

    if (movement.status !== MovementStatus.PENDING) {
      throw new InvalidMovementException("Only pending movements can be approved");
    }

    movement.status = MovementStatus.COMPLETED;
    movement.approvedBy = approvedBy;
    movement.approvedAt = new Date();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (movement.movementType === MovementType.OUT) {
        if (movement.warehouseId) {
          await this.validateStockAvailability(
            movement.itemId,
            movement.quantity,
            movement.warehouseId,
            queryRunner
          );
        }
      }

      const savedMovement = await queryRunner.manager.save(movement);
      await this.updateStockLevels(savedMovement, queryRunner);
      
      await queryRunner.commitTransaction();
      
      this.logger.log(`Stock movement approved successfully with ID: ${id}`);
      return savedMovement;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to approve stock movement ${id}: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cancel(id: string): Promise<StockMovement> {
    const movement = await this.findOne(id);

    if (movement.status === MovementStatus.COMPLETED) {
      throw new InvalidMovementException("Cannot cancel completed movement");
    }

    movement.status = MovementStatus.CANCELLED;

    try {
      const cancelledMovement = await this.stockMovementRepository.save(movement);
      this.logger.log(`Stock movement cancelled successfully with ID: ${id}`);
      return cancelledMovement;
    } catch (error) {
      this.logger.error(`Failed to cancel stock movement ${id}: ${error.message}`);
      throw error;
    }
  }

  async createBatch(batchDto: BatchStockMovementDto): Promise<StockMovement[]> {
    this.logger.log(`Creating batch of ${batchDto.movements.length} stock movements`);

    batchDto.movements.forEach((movement) => {
      this.validateMovementRequest(movement);
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const movements = batchDto.movements.map((movementDto) =>
        this.stockMovementRepository.create({
          ...movementDto,
          batchNumber: batchDto.batchReference,
          metadata: {
            ...movementDto.metadata,
            batchNotes: batchDto.notes,
          },
          expiryDate: movementDto.expiryDate
            ? new Date(movementDto.expiryDate)
            : undefined,
        })
      );

      for (const movement of movements) {
        if (movement.movementType === MovementType.OUT) {
          await this.validateStockAvailability(
            movement.itemId,
            movement.quantity,
            movement.warehouseId,
            queryRunner
          );
        }
      }

      const savedMovements = await queryRunner.manager.save(movements);
      
      for (const movement of savedMovements) {
        await this.updateStockLevels(movement, queryRunner);
      }
      
      await queryRunner.commitTransaction();
      
      this.logger.log(`Batch stock movements created successfully: ${savedMovements.length} movements`);
      return savedMovements;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create batch stock movements: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getMovementSummary(
    itemId?: string,
    warehouseId?: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<MovementSummary> {
    const queryBuilder = this.stockMovementRepository
      .createQueryBuilder("movement")
      .select([
        "movement.movementType",
        "SUM(movement.quantity) as totalQuantity",
      ])
      .where("movement.status = :status", { status: MovementStatus.COMPLETED })
      .groupBy("movement.movementType");

    if (itemId) {
      queryBuilder.andWhere("movement.itemId = :itemId", { itemId });
    }

    if (warehouseId) {
      queryBuilder.andWhere(
        "(movement.warehouseId = :warehouseId OR movement.fromWarehouseId = :warehouseId OR movement.toWarehouseId = :warehouseId)",
        { warehouseId }
      );
    }

    if (dateFrom && dateTo) {
      queryBuilder.andWhere("movement.createdAt BETWEEN :dateFrom AND :dateTo", {
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
      });
    }

    const results = await queryBuilder.getRawMany();

    const summary: MovementSummary = {
      totalIn: 0,
      totalOut: 0,
      totalTransfers: 0,
      totalAdjustments: 0,
      netMovement: 0,
    };

    results.forEach((result: any) => {
      const quantity = parseInt(result.totalQuantity);
      switch (result.movement_movementType) {
        case MovementType.IN:
          summary.totalIn = quantity;
          break;
        case MovementType.OUT:
          summary.totalOut = quantity;
          break;
        case MovementType.TRANSFER:
          summary.totalTransfers = quantity;
          break;
        case MovementType.ADJUSTMENT:
          summary.totalAdjustments = quantity;
          break;
      }
    });

    summary.netMovement = summary.totalIn - summary.totalOut + summary.totalAdjustments;

    return summary;
  }

  private validateMovementRequest(dto: CreateStockMovementDto): void {
    switch (dto.movementType) {
      case MovementType.IN:
      case MovementType.OUT:
        if (!dto.warehouseId) {
          throw new InvalidMovementException(
            `${dto.movementType} movements require warehouseId`
          );
        }
        break;
      case MovementType.TRANSFER:
        if (!dto.fromWarehouseId || !dto.toWarehouseId) {
          throw new InvalidMovementException(
            "Transfer movements require both fromWarehouseId and toWarehouseId"
          );
        }
        if (dto.fromWarehouseId === dto.toWarehouseId) {
          throw new InvalidMovementException(
            "Transfer source and destination warehouses must be different"
          );
        }
        break;
      case MovementType.ADJUSTMENT:
        if (!dto.warehouseId) {
          throw new InvalidMovementException(
            "Adjustment movements require warehouseId"
          );
        }
        if (!dto.reason) {
          throw new InvalidMovementException(
            "Adjustment movements require a reason"
          );
        }
        break;
    }

    if (dto.totalCost && dto.unitCost && dto.totalCost !== dto.unitCost * dto.quantity) {
      throw new InvalidMovementException(
        "Total cost must equal unit cost multiplied by quantity"
      );
    }
  }

  private async validateStockAvailability(
    itemId: string,
    quantity: number,
    warehouseId: string,
    queryRunner?: any
  ): Promise<void> {
    const availableStock = await this.stockLevelService.getAvailableStock(
      itemId,
      warehouseId
    );

    if (availableStock < quantity) {
      throw new InsufficientStockException(itemId, availableStock, quantity);
    }
  }

  private async updateStockLevels(
    movement: StockMovement,
    queryRunner?: any
  ): Promise<void> {
    await this.stockLevelService.updateStockLevel(movement, queryRunner);
  }

  private buildSortOptions(
    sortBy: string[],
    sortOrder: "asc" | "desc"
  ): Record<string, "ASC" | "DESC"> {
    const order: Record<string, "ASC" | "DESC"> = {};

    if (sortBy && sortBy.length > 0) {
      sortBy.forEach((field) => {
        order[field] = sortOrder.toUpperCase() as "ASC" | "DESC";
      });
    } else {
      order.createdAt = "DESC";
    }

    return order;
  }
}