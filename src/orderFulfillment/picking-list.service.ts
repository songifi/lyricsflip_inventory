// orderFulfillment/picking-list.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PickingList } from './entities/picking-list.entity';
import { PickingListItem } from './entities/picking-list-item.entity';
import { Order } from './entities/order.entity';
import { InventoryService } from './inventory.service';

@Injectable()
export class PickingListService {
  constructor(
    @InjectRepository(PickingList)
    private pickingListRepository: Repository<PickingList>,
    @InjectRepository(PickingListItem)
    private pickingListItemRepository: Repository<PickingListItem>,
    private inventoryService: InventoryService,
  ) {}

  async createPickingList(order: Order) {
    const pickingList = this.pickingListRepository.create({
      orderId: order.id,
      status: 'pending',
      createdAt: new Date(),
    });

    const savedPickingList = await this.pickingListRepository.save(pickingList);

    const pickingListItems = [];

    for (const orderItem of order.items) {
      const inventory = await this.inventoryService.getInventoryByProductId(orderItem.productId);
      
      const pickingListItem = this.pickingListItemRepository.create({
        pickingListId: savedPickingList.id,
        productId: orderItem.productId,
        quantity: orderItem.quantity,
        location: inventory?.location || 'Unknown',
        status: 'pending',
      });

      pickingListItems.push(pickingListItem);
    }

    await this.pickingListItemRepository.save(pickingListItems);

    return this.getPickingListWithItems(savedPickingList.id);
  }

  async getPickingListWithItems(pickingListId: string) {
    return this.pickingListRepository.findOne({
      where: { id: pickingListId },
      relations: ['items'],
    });
  }

  async updatePickingListStatus(pickingListId: string, status: string) {
    const pickingList = await this.pickingListRepository.findOne({
      where: { id: pickingListId },
    });

    if (pickingList) {
      pickingList.status = status;
      return this.pickingListRepository.save(pickingList);
    }

    return null;
  }
}

