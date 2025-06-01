import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from '../entities/inventory-item.entity';
import { CreateInventoryItemDto } from '../dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from '../dto/update-inventory-item.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
  ) {}

  async create(createInventoryItemDto: CreateInventoryItemDto): Promise<InventoryItem> {
    const item = this.inventoryRepository.create(createInventoryItemDto);
    
    // Update storage location occupancy if assigned
    if (item.storageLocationId) {
      await this.updateLocationOccupancy(item.storageLocationId, true);
    }
    
    return this.inventoryRepository.save(item);
  }

  async findAll(): Promise<InventoryItem[]> {
    return this.inventoryRepository.find({
      relations: ['warehouse', 'storageLocation'],
      order: { productName: 'ASC' }
    });
  }

  async findByWarehouse(warehouseId: string): Promise<InventoryItem[]> {
    return this.inventoryRepository.find({
      where: { warehouseId },
      relations: ['storageLocation'],
      order: { productName: 'ASC' }
    });
  }

  async findByLocation(storageLocationId: string): Promise<InventoryItem[]> {
    return this.inventoryRepository.find({
      where: { storageLocationId },
      relations: ['warehouse'],
      order: { productName: 'ASC' }
    });
  }

  async findOne(id: string): Promise<InventoryItem> {
    const item = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['warehouse', 'storageLocation']
    });

    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    return item;
  }

  async update(id: string, updateInventoryItemDto: UpdateInventoryItemDto): Promise<InventoryItem> {
    const item = await this.findOne(id);
    const oldLocationId = item.storageLocationId;
    
    Object.assign(item, updateInventoryItemDto);
    
    // Handle location changes
    if (oldLocationId !== item.storageLocationId) {
      if (oldLocationId) {
        await this.updateLocationOccupancy(oldLocationId, false);
      }
      if (item.storageLocationId) {
        await this.updateLocationOccupancy(item.storageLocationId, true);
      }
    }
    
    return this.inventoryRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    
    if (item.storageLocationId) {
      await this.updateLocationOccupancy(item.storageLocationId, false);
    }
    
    await this.inventoryRepository.remove(item);
  }

  async adjustQuantity(id: string, quantityChange: number): Promise<InventoryItem> {
    const item = await this.findOne(id);
    item.quantity += quantityChange;
    
    if (item.quantity < 0) {
      item.quantity = 0;
    }
    
    return this.inventoryRepository.save(item);
  }

  private async updateLocationOccupancy(locationId: string, isOccupied: boolean): Promise<void> {
    // This would update the storage location's occupancy status
    // Implementation depends on your business logic
    // You might want to inject StorageLocationService here
  }

  async getLowStockItems(warehouseId?: string, threshold: number = 10): Promise<InventoryItem[]> {
    const query = this.inventoryRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.warehouse', 'warehouse')
      .leftJoinAndSelect('item.storageLocation', 'location')
      .where('item.quantity <= :threshold', { threshold });

    if (warehouseId) {
      query.andWhere('item.warehouseId = :warehouseId', { warehouseId });
    }

    return query.orderBy('item.quantity', 'ASC').getMany();
  }
}

