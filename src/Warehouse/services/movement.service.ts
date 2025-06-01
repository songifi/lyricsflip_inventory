import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryMovement, MovementType, MovementStatus } from '../entities/inventory-movement.entity';
import { CreateInventoryMovementDto } from '../dto/create-inventory-movement.dto';
import { InventoryService } from './inventory.service';
import { StorageLocationService } from './storage-location.service';

@Injectable()
export class MovementService {
  constructor(
    @InjectRepository(InventoryMovement)
    private movementRepository: Repository<InventoryMovement>,
    private inventoryService: InventoryService,
    private locationService: StorageLocationService,
  ) {}

  async create(createMovementDto: CreateInventoryMovementDto): Promise<InventoryMovement> {
    const movementNumber = await this.generateMovementNumber();
    
    const movement = this.movementRepository.create({
      ...createMovementDto,
      movementNumber,
      status: MovementStatus.PENDING
    });

    return this.movementRepository.save(movement);
  }

  async executeMovement(id: string): Promise<InventoryMovement> {
    const movement = await this.movementRepository.findOne({
      where: { id },
      relations: ['inventoryItem', 'fromLocation', 'toLocation']
    });

    if (!movement) {
      throw new NotFoundException('Movement not found');
    }

    if (movement.status !== MovementStatus.PENDING) {
      throw new BadRequestException('Movement is not in pending status');
    }

    // Update movement status
    movement.status = MovementStatus.IN_PROGRESS;
    await this.movementRepository.save(movement);

    try {
      // Execute the movement based on type
      switch (movement.type) {
        case MovementType.INBOUND:
          await this.executeInbound(movement);
          break;
        case MovementType.OUTBOUND:
          await this.executeOutbound(movement);
          break;
        case MovementType.TRANSFER:
          await this.executeTransfer(movement);
          break;
        case MovementType.ADJUSTMENT:
          await this.executeAdjustment(movement);
          break;
      }

      // Mark as completed
      movement.status = MovementStatus.COMPLETED;
      movement.completedDate = new Date();
      
    } catch (error) {
      // Rollback on error
      movement.status = MovementStatus.PENDING;
      throw error;
    }

    return this.movementRepository.save(movement);
  }

  private async executeInbound(movement: InventoryMovement): Promise<void> {
    await this.inventoryService.adjustQuantity(movement.inventoryItemId, movement.quantity);
    
    if (movement.toLocationId) {
      await this.inventoryService.update(movement.inventoryItemId, {
        storageLocationId: movement.toLocationId
      });
    }
  }

  private async executeOutbound(movement: InventoryMovement): Promise<void> {
    const item = await this.inventoryService.findOne(movement.inventoryItemId);
    
    if (item.quantity < movement.quantity) {
      throw new BadRequestException('Insufficient inventory quantity');
    }
    
    await this.inventoryService.adjustQuantity(movement.inventoryItemId, -movement.quantity);
  }

  private async executeTransfer(movement: InventoryMovement): Promise<void> {
    if (!movement.fromLocationId || !movement.toLocationId) {
      throw new BadRequestException('Transfer requires both from and to locations');
    }

    await this.inventoryService.update(movement.inventoryItemId, {
      storageLocationId: movement.toLocationId
    });
  }

  private async executeAdjustment(movement: InventoryMovement): Promise<void> {
    const item = await this.inventoryService.findOne(movement.inventoryItemId);
    const adjustmentQuantity = movement.quantity - item.quantity;
    await this.inventoryService.adjustQuantity(movement.inventoryItemId, adjustmentQuantity);
  }

  private async generateMovementNumber(): Promise<string> {
    const date = new Date();
    const prefix = 'MV';
    const timestamp = date.getFullYear().toString() + 
                     (date.getMonth() + 1).toString().padStart(2, '0') + 
                     date.getDate().toString().padStart(2, '0');
    
    const count = await this.movementRepository.count({
      where: { movementNumber: Like(`${prefix}${timestamp}%`) }
    });
    
    return `${prefix}${timestamp}${(count + 1).toString().padStart(4, '0')}`;
  }

  async findAll(): Promise<InventoryMovement[]> {
    return this.movementRepository.find({
      relations: ['inventoryItem', 'fromLocation', 'toLocation', 'warehouse', 'user'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByWarehouse(warehouseId: string): Promise<InventoryMovement[]> {
    return this.movementRepository.find({
      where: { warehouseId },
      relations: ['inventoryItem', 'fromLocation', 'toLocation', 'user'],
      order: { createdAt: 'DESC' }
    });
  }

  async getMovementHistory(inventoryItemId: string): Promise<InventoryMovement[]> {
    return this.movementRepository.find({
      where: { inventoryItemId },
      relations: ['fromLocation', 'toLocation', 'user'],
      order: { createdAt: 'DESC' }
    });
  }
}

