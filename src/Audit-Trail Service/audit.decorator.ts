import { SetMetadata } from '@nestjs/common';
import { AUDIT_METADATA_KEY, AuditMetadata } from './audit.interceptor';

export const Audit = (metadata: AuditMetadata) =>
  SetMetadata(AUDIT_METADATA_KEY, metadata);

// inventory.controller.ts (Example usage)
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { AuditInterceptor } from './audit.interceptor';
import { Audit } from './audit.decorator';
import { AuditAction, AuditEntityType } from './audit-log.entity';
import { InventoryService } from './inventory.service';

@Controller('inventory')
@UseInterceptors(AuditInterceptor)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Post()
  @Audit({
    action: AuditAction.CREATE,
    entityType: AuditEntityType.INVENTORY_ITEM,
    getEntityId: (result) => result.id,
  })
  async createItem(@Body() createItemDto: any) {
    return await this.inventoryService.create(createItemDto);
  }

  @Put(':id')
  @Audit({
    action: AuditAction.UPDATE,
    entityType: AuditEntityType.INVENTORY_ITEM,
  })
  async updateItem(@Param('id') id: string, @Body() updateItemDto: any) {
    const oldItem = await this.inventoryService.findOne(id);
    const updatedItem = await this.inventoryService.update(id, updateItemDto);
    
    // Store old values for audit
    updateItemDto.oldValues = oldItem;
    
    return updatedItem;
  }

  @Delete(':id')
  @Audit({
    action: AuditAction.DELETE,
    entityType: AuditEntityType.INVENTORY_ITEM,
  })
  async deleteItem(@Param('id') id: string) {
    return await this.inventoryService.remove(id);
  }

  @Post(':id/stock-in')
  @Audit({
    action: AuditAction.STOCK_IN,
    entityType: AuditEntityType.INVENTORY_ITEM,
  })
  async stockIn(@Param('id') id: string, @Body() stockData: any) {
    return await this.inventoryService.stockIn(id, stockData);
  }

  @Post(':id/stock-out')
  @Audit({
    action: AuditAction.STOCK_OUT,
    entityType: AuditEntityType.INVENTORY_ITEM,
  })
  async stockOut(@Param('id') id: string, @Body() stockData: any) {
    return await this.inventoryService.stockOut(id, stockData);
  }
}
