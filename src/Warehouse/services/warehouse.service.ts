import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from '../entities/warehouse.entity';
import { CreateWarehouseDto } from '../dto/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/update-warehouse.dto';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
  ) {}

  async create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
    const existingWarehouse = await this.warehouseRepository.findOne({
      where: { code: createWarehouseDto.code }
    });

    if (existingWarehouse) {
      throw new ConflictException('Warehouse with this code already exists');
    }

    const warehouse = this.warehouseRepository.create(createWarehouseDto);
    return this.warehouseRepository.save(warehouse);
  }

  async findAll(): Promise<Warehouse[]> {
    return this.warehouseRepository.find({
      relations: ['storageLocations'],
      order: { name: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id },
      relations: ['storageLocations', 'inventoryItems']
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    return warehouse;
  }

  async update(id: string, updateWarehouseDto: UpdateWarehouseDto): Promise<Warehouse> {
    const warehouse = await this.findOne(id);
    
    if (updateWarehouseDto.code && updateWarehouseDto.code !== warehouse.code) {
      const existingWarehouse = await this.warehouseRepository.findOne({
        where: { code: updateWarehouseDto.code }
      });
      if (existingWarehouse) {
        throw new ConflictException('Warehouse with this code already exists');
      }
    }

    Object.assign(warehouse, updateWarehouseDto);
    return this.warehouseRepository.save(warehouse);
  }

  async remove(id: string): Promise<void> {
    const warehouse = await this.findOne(id);
    await this.warehouseRepository.remove(warehouse);
  }

  async getWarehouseStats(id: string) {
    const warehouse = await this.findOne(id);
    
    // Get storage location counts
    const totalLocations = await this.warehouseRepository
      .createQueryBuilder('w')
      .leftJoin('w.storageLocations', 'sl')
      .where('w.id = :id', { id })
      .getCount();

    const occupiedLocations = await this.warehouseRepository
      .createQueryBuilder('w')
      .leftJoin('w.storageLocations', 'sl')
      .where('w.id = :id AND sl.isOccupied = true', { id })
      .getCount();

    // Get inventory stats
    const totalItems = await this.warehouseRepository
      .createQueryBuilder('w')
      .leftJoin('w.inventoryItems', 'ii')
      .where('w.id = :id', { id })
      .select('SUM(ii.quantity)', 'total')
      .getRawOne();

    return {
      warehouse,
      stats: {
        totalLocations,
        occupiedLocations,
        availableLocations: totalLocations - occupiedLocations,
        totalInventoryItems: parseInt(totalItems?.total || '0')
      }
    };
  }
}

