import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { StorageLocationService } from '../services/storage-location.service';
import { CreateStorageLocationDto } from '../dto/create-storage-location.dto';
import { UpdateStorageLocationDto } from '../dto/update-storage-location.dto';

@Controller('storage-locations')
export class StorageLocationController {
  constructor(private readonly storageLocationService: StorageLocationService) {}

  @Post()
  create(@Body() createStorageLocationDto: CreateStorageLocationDto) {
    return this.storageLocationService.create(createStorageLocationDto);
  }

  @Get()
  findAll(@Query('warehouseId') warehouseId?: string) {
    if (warehouseId) {
      return this.storageLocationService.findByWarehouse(warehouseId);
    }
    return this.storageLocationService.findAll();
  }

  @Get('hierarchy/:warehouseId')
  getHierarchy(@Param('warehouseId') warehouseId: string) {
    return this.storageLocationService.findHierarchy(warehouseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storageLocationService.findOne(id);
  }

  @Get(':id/path')
  getPath(@Param('id') id: string) {
    return this.storageLocationService.getLocationPath(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStorageLocationDto: UpdateStorageLocationDto) {
    return this.storageLocationService.update(id, updateStorageLocationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storageLocationService.remove(id);
  }
}

