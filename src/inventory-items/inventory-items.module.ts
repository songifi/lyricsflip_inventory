import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItemsService } from './inventory-items.service';
import { InventoryItemsController } from './inventory-items.controller';
import { InventoryItem } from './entities/inventory-item.entity';
import { InventoryItemImage } from './entities/inventory-item-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryItem, InventoryItemImage])],
  controllers: [InventoryItemsController],
  providers: [InventoryItemsService],
  exports: [InventoryItemsService],
})
export class InventoryItemsModule {}