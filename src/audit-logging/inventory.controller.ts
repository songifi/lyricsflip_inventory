import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto, UpdateInventoryDto } from './inventory.dto';
import { AuditLog } from '../audit-log/audit-log.decorator';
import { AuditLogInterceptor } from '../audit-log/audit-log.interceptor';

@Controller('inventory')
@UseInterceptors(AuditLogInterceptor)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @AuditLog({
    entityName: 'inventory',
    action: 'READ',
    description: 'Retrieved inventory list',
  })
  async findAll() {
    return this.inventoryService.findAll();
  }

  @Post()
  @AuditLog({
    entityName: 'inventory',
    action: 'CREATE',
    description: 'Created new inventory item',
    includeRequestBody: true,
    includeResponseBody: true,
  })
  async create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Put(':id')
  @AuditLog({
    entityName: 'inventory',
    action: 'UPDATE',
    description: 'Updated inventory item',
    includeRequestBody: true,
    includeResponseBody: true,
  })
  async update(@Param('id') id: string, @Body() updateInventoryDto: UpdateInventoryDto) {
    return this.inventoryService.update(id, updateInventoryDto);
  }

  @Delete(':id')
  @AuditLog({
    entityName: 'inventory',
    action: 'DELETE',
    description: 'Deleted inventory item',
  })
  async remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }
}
