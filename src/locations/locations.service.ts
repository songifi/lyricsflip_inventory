import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, DataSource } from 'typeorm';
import { Location, LocationType } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationItem } from './entities/location-item.entity';

interface ListQuery {
  search?: string;
  type?: LocationType;
  parentId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
    @InjectRepository(LocationItem)
    private readonly locationItemRepo: Repository<LocationItem>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Escapes special characters in search terms to prevent SQL LIKE injection
   * Escapes: %, _, and \ characters by prefixing them with backslash
   */
  private escapeSearchTerm(searchTerm: string): string {
    // Trim whitespace and limit length for security
    const trimmed = searchTerm.trim();
    if (trimmed.length > 100) {
      throw new BadRequestException(
        'Search term too long (max 100 characters)',
      );
    }

    // Escape special characters: %, _, and \
    return trimmed.replace(/([%_\\])/g, '\\$1');
  }

  async create(dto: CreateLocationDto): Promise<Location> {
    if (dto.parentId) {
      const parent = await this.locationRepo.findOne({
        where: { id: dto.parentId },
      });
      if (!parent) throw new BadRequestException('Parent location not found');
      this.validateHierarchy(dto.type, parent.type);
    }

    const entity = this.locationRepo.create({ ...dto });
    return this.locationRepo.save(entity);
  }

  async findAll(query: ListQuery) {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20)));
    const where: FindOptionsWhere<Location> = {};
    if (query.type) where.type = query.type;
    if (query.parentId) where.parentId = query.parentId;
    if (query.search) {
      const escapedSearch = this.escapeSearchTerm(query.search);
      Object.assign(where, { name: Like(`%${escapedSearch}%`) });
    }
    const [data, total] = await this.locationRepo.findAndCount({
      where,
      order: { name: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Location> {
    const entity = await this.locationRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Location not found');
    return entity;
  }

  async update(id: string, dto: UpdateLocationDto): Promise<Location> {
    const entity = await this.findOne(id);
    if (dto.parentId) {
      const parent = await this.locationRepo.findOne({
        where: { id: dto.parentId },
      });
      if (!parent) throw new BadRequestException('Parent location not found');
      const type = dto.type ?? entity.type;
      this.validateHierarchy(type, parent.type);
    }
    Object.assign(entity, dto);
    return this.locationRepo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    const childrenCount = await this.locationRepo.count({
      where: { parentId: id },
    });
    if (childrenCount > 0)
      throw new BadRequestException('Cannot delete location with children');
    await this.locationRepo.delete(entity.id);
  }

  async getItems(id: string) {
    await this.ensureExists(id);
    return this.locationItemRepo.find({ where: { locationId: id } });
  }

  async getCapacity(id: string) {
    const loc = await this.findOne(id);
    const items = await this.locationItemRepo.find({
      where: { locationId: id },
    });
    const usedUnits = items.reduce((sum, li) => sum + (li.quantity ?? 0), 0);
    const capacityUnits = loc.capacityUnits ?? 0;
    const utilization = capacityUnits > 0 ? usedUnits / capacityUnits : 0;
    return { capacityUnits, usedUnits, utilization };
  }

  async trackItem(locationId: string, itemId: string, delta: number) {
    return this.dataSource.transaction(async (manager) => {
      const location = await manager.findOne(Location, {
        where: { id: locationId },
      });
      if (!location) throw new NotFoundException('Location not found');

      let ref = await manager.findOne(LocationItem, {
        where: { locationId, itemId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!ref) {
        ref = manager.create(LocationItem, { locationId, itemId, quantity: 0 });
      }

      const nextQty = Math.max(0, (ref.quantity ?? 0) + delta);
      ref.quantity = nextQty;

      return manager.save(LocationItem, ref);
    });
  }

  private validateHierarchy(child: LocationType, parent: LocationType) {
    if (child === LocationType.WAREHOUSE)
      throw new BadRequestException('Warehouse cannot have a parent');
    if (child === LocationType.ZONE && parent !== LocationType.WAREHOUSE)
      throw new BadRequestException('Zone must be under a warehouse');
    if (child === LocationType.SHELF && parent !== LocationType.ZONE)
      throw new BadRequestException('Shelf must be under a zone');
  }

  private async ensureExists(id: string) {
    const found = await this.locationRepo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('Location not found');
  }
}
