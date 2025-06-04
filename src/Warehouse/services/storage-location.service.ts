import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageLocation, LocationType } from '../entities/storage-location.entity';
import { CreateStorageLocationDto } from '../dto/create-storage-location.dto';
import { UpdateStorageLocationDto } from '../dto/update-storage-location.dto';

@Injectable()
export class StorageLocationService {
  constructor(
    @InjectRepository(StorageLocation)
    private storageLocationRepository: Repository<StorageLocation>,
  ) {}

  async create(createStorageLocationDto: CreateStorageLocationDto): Promise<StorageLocation> {
    // Validate parent-child relationship
    if (createStorageLocationDto.parentLocationId) {
      const parentLocation = await this.storageLocationRepository.findOne({
        where: { id: createStorageLocationDto.parentLocationId }
      });

      if (!parentLocation) {
        throw new NotFoundException('Parent location not found');
      }

      // Validate hierarchy: Zone -> Aisle -> Shelf
      if (
        (createStorageLocationDto.type === LocationType.AISLE && parentLocation.type !== LocationType.ZONE) ||
        (createStorageLocationDto.type === LocationType.SHELF && parentLocation.type !== LocationType.AISLE)
      ) {
        throw new BadRequestException('Invalid storage location hierarchy');
      }
    }

    const location = this.storageLocationRepository.create(createStorageLocationDto);
    return this.storageLocationRepository.save(location);
  }

  async findAll(): Promise<StorageLocation[]> {
    return this.storageLocationRepository.find({
      relations: ['warehouse', 'parentLocation', 'childLocations'],
      order: { code: 'ASC' }
    });
  }

  async findByWarehouse(warehouseId: string): Promise<StorageLocation[]> {
    return this.storageLocationRepository.find({
      where: { warehouseId },
      relations: ['parentLocation', 'childLocations'],
      order: { code: 'ASC' }
    });
  }

  async findHierarchy(warehouseId: string): Promise<StorageLocation[]> {
    // Get zones (top level)
    const zones = await this.storageLocationRepository.find({
      where: { 
        warehouseId, 
        type: LocationType.ZONE,
        parentLocationId: undefined 
      },
      relations: ['childLocations', 'childLocations.childLocations'],
      order: { code: 'ASC' }
    });

    return zones;
  }

  async findOne(id: string): Promise<StorageLocation> {
    const location = await this.storageLocationRepository.findOne({
      where: { id },
      relations: ['warehouse', 'parentLocation', 'childLocations', 'inventoryItems']
    });

    if (!location) {
      throw new NotFoundException(`Storage location with ID ${id} not found`);
    }

    return location;
  }

  async update(id: string, updateStorageLocationDto: UpdateStorageLocationDto): Promise<StorageLocation> {
    const location = await this.findOne(id);
    Object.assign(location, updateStorageLocationDto);
    return this.storageLocationRepository.save(location);
  }

  async remove(id: string): Promise<void> {
    const location = await this.findOne(id);
    
    // Check if location has child locations
    if (location.childLocations && location.childLocations.length > 0) {
      throw new BadRequestException('Cannot delete location with child locations');
    }

    // Check if location has inventory items
    if (location.inventoryItems && location.inventoryItems.length > 0) {
      throw new BadRequestException('Cannot delete location with inventory items');
    }

    await this.storageLocationRepository.remove(location);
  }

  async getLocationPath(id: string): Promise<string> {
    const location = await this.findOne(id);
    const path = [location.code];
    
    let current = location;
    while (current.parentLocation) {
      current = await this.findOne(current.parentLocation.id);
      path.unshift(current.code);
    }
    
    return path.join(' > ');
  }
}

