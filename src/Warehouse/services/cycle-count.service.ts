import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CycleCount, CycleCountStatus } from '../entities/cycle-count.entity';
import { CycleCountItem } from '../entities/cycle-count-item.entity';
import { CreateCycleCountDto } from '../dto/create-cycle-count.dto';
import { InventoryService } from './inventory.service';

@Injectable()
export class CycleCountService {
  constructor(
    @InjectRepository(CycleCount)
    private cycleCountRepository: Repository<CycleCount>,
    @InjectRepository(CycleCountItem)
    private cycleCountItemRepository: Repository<CycleCountItem>,
    private inventoryService: InventoryService,
  ) {}

  async create(createCycleCountDto: CreateCycleCountDto): Promise<CycleCount> {
    const countNumber = await this.generateCountNumber();
    
    const cycleCount = this.cycleCountRepository.create({
      ...createCycleCountDto,
      countNumber
    });

    const savedCount = await this.cycleCountRepository.save(cycleCount);

    // Generate cycle count items based on location
    await this.generateCountItems(savedCount);

    return savedCount;
  }

  private async generateCountItems(cycleCount: CycleCount): Promise<void> {
    let inventoryItems;
    
    if (cycleCount.locationId) {
      inventoryItems = await this.inventoryService.findByLocation(cycleCount.locationId);
    } else {
      inventoryItems = await this.inventoryService.findByWarehouse(cycleCount.warehouseId);
    }

    const countItems = inventoryItems.map(item => ({
      cycleCountId: cycleCount.id,
      inventoryItemId: item.id,
      systemQuantity: item.quantity,
      variance: 0
    }));

    await this.cycleCountItemRepository.save(countItems);
  }

  async startCount(id: string): Promise<CycleCount> {
    const cycleCount = await this.findOne(id);
    cycleCount.status = CycleCountStatus.IN_PROGRESS;
    cycleCount.startedAt = new Date();
    return this.cycleCountRepository.save(cycleCount);
  }

  async updateCountItem(itemId: string, countedQuantity: number, notes?: string): Promise<CycleCountItem> {
    const countItem = await this.cycleCountItemRepository.findOne({
      where: { id: itemId },
      relations: ['inventoryItem']
    });

    if (!countItem) {
      throw new NotFoundException('Cycle count item not found');
    }

    countItem.countedQuantity = countedQuantity;
    countItem.variance = countedQuantity - countItem.systemQuantity;
    if (notes) countItem.notes = notes;

    return this.cycleCountItemRepository.save(countItem);
  }

  async completeCount(id: string, applyAdjustments: boolean = false): Promise<CycleCount> {
    const cycleCount = await this.cycleCountRepository.findOne({
      where: { id },
      relations: ['items', 'items.inventoryItem']
    });

    if (!cycleCount) {
      throw new NotFoundException('Cycle count not found');
    }

    if (applyAdjustments) {
      // Apply quantity adjustments for items with variances
      for (const item of cycleCount.items) {
        if (item.variance !== 0 && item.countedQuantity !== null) {
          await this.inventoryService.adjustQuantity(
            item.inventoryItemId, 
            item.variance
          );
        }
      }
    }

    cycleCount.status = CycleCountStatus.COMPLETED;
    cycleCount.completedAt = new Date();

    return this.cycleCountRepository.save(cycleCount);
  }

  private async generateCountNumber(): Promise<string> {
    const date = new Date();
    const prefix = 'CC';
    const timestamp = date.getFullYear().toString() + 
                     (date.getMonth() + 1).toString().padStart(2, '0');
    
    const count = await this.cycleCountRepository.count({
      where: { countNumber: Like(`${prefix}${timestamp}%`) }
    });
    
    return `${prefix}${timestamp}${(count + 1).toString().padStart(4, '0')}`;
  }

  async findOne(id: string): Promise<CycleCount> {
    const cycleCount = await this.cycleCountRepository.findOne({
      where: { id }
    });
    if (!cycleCount) {
      throw new NotFoundException('Cycle count not found');
    }
    return cycleCount;
  }
}
