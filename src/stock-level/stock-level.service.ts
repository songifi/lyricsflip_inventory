import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, QueryRunner } from "typeorm";
import { StockLevel } from "./stock-level.entity";
import { StockMovement, MovementType } from "../stock-movement/stock-movement.entity";

@Injectable()
export class StockLevelService {
  private readonly logger = new Logger(StockLevelService.name);

  constructor(
    @InjectRepository(StockLevel)
    private stockLevelRepository: Repository<StockLevel>
  ) {}

  async updateStockLevel(
    movement: StockMovement,
    queryRunner?: QueryRunner
  ): Promise<void> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(StockLevel)
      : this.stockLevelRepository;

    switch (movement.movementType) {
      case MovementType.IN:
        await this.handleInboundMovement(movement, repository);
        break;
      case MovementType.OUT:
        await this.handleOutboundMovement(movement, repository);
        break;
      case MovementType.TRANSFER:
        await this.handleTransferMovement(movement, repository);
        break;
      case MovementType.ADJUSTMENT:
        await this.handleAdjustmentMovement(movement, repository);
        break;
    }

    this.logger.log(
      `Stock level updated for movement ${movement.id}, type: ${movement.movementType}`
    );
  }

  async getStockLevel(itemId: string, warehouseId: string): Promise<number> {
    const stockLevel = await this.stockLevelRepository.findOne({
      where: { itemId, warehouseId },
    });

    return stockLevel ? stockLevel.availableQuantity : 0;
  }

  async getAvailableStock(itemId: string, warehouseId: string): Promise<number> {
    const stockLevel = await this.stockLevelRepository.findOne({
      where: { itemId, warehouseId },
    });

    if (!stockLevel) {
      return 0;
    }

    return Math.max(0, stockLevel.quantity - stockLevel.reservedQuantity);
  }

  private async handleInboundMovement(
    movement: StockMovement,
    repository: Repository<StockLevel>
  ): Promise<void> {
    let stockLevel = await repository.findOne({
      where: { itemId: movement.itemId, warehouseId: movement.warehouseId },
    });

    if (!stockLevel) {
      stockLevel = repository.create({
        itemId: movement.itemId,
        warehouseId: movement.warehouseId,
        quantity: movement.quantity,
        reservedQuantity: 0,
        availableQuantity: movement.quantity,
        lastMovementAt: new Date(),
      });
    } else {
      stockLevel.quantity += movement.quantity;
      stockLevel.availableQuantity = stockLevel.quantity - stockLevel.reservedQuantity;
      stockLevel.lastMovementAt = new Date();
    }

    await repository.save(stockLevel);
  }

  private async handleOutboundMovement(
    movement: StockMovement,
    repository: Repository<StockLevel>
  ): Promise<void> {
    let stockLevel = await repository.findOne({
      where: { itemId: movement.itemId, warehouseId: movement.warehouseId },
    });

    if (!stockLevel) {
      stockLevel = repository.create({
        itemId: movement.itemId,
        warehouseId: movement.warehouseId,
        quantity: -movement.quantity,
        reservedQuantity: 0,
        availableQuantity: -movement.quantity,
        lastMovementAt: new Date(),
      });
    } else {
      stockLevel.quantity -= movement.quantity;
      stockLevel.availableQuantity = stockLevel.quantity - stockLevel.reservedQuantity;
      stockLevel.lastMovementAt = new Date();
    }

    await repository.save(stockLevel);
  }

  private async handleTransferMovement(
    movement: StockMovement,
    repository: Repository<StockLevel>
  ): Promise<void> {
    await this.handleOutboundMovement(
      {
        ...movement,
        warehouseId: movement.fromWarehouseId,
        movementType: MovementType.OUT,
      } as StockMovement,
      repository
    );

    await this.handleInboundMovement(
      {
        ...movement,
        warehouseId: movement.toWarehouseId,
        movementType: MovementType.IN,
      } as StockMovement,
      repository
    );
  }

  private async handleAdjustmentMovement(
    movement: StockMovement,
    repository: Repository<StockLevel>
  ): Promise<void> {
    let stockLevel = await repository.findOne({
      where: { itemId: movement.itemId, warehouseId: movement.warehouseId },
    });

    if (!stockLevel) {
      stockLevel = repository.create({
        itemId: movement.itemId,
        warehouseId: movement.warehouseId,
        quantity: movement.quantity,
        reservedQuantity: 0,
        availableQuantity: movement.quantity,
        lastMovementAt: new Date(),
      });
    } else {
      stockLevel.quantity = movement.quantity;
      stockLevel.availableQuantity = stockLevel.quantity - stockLevel.reservedQuantity;
      stockLevel.lastMovementAt = new Date();
    }

    await repository.save(stockLevel);
  }
}