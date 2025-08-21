import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, In } from 'typeorm';
import { InventoryItem, InventoryItemStatus } from './entities/inventory-item.entity';
import { InventoryItemImage } from './entities/inventory-item-image.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { InventoryItemQueryDto } from './dto/inventory-item-query.dto';
import { Category } from '../categories/category.entity';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class InventoryItemsService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryItemRepository: Repository<InventoryItem>,
    @InjectRepository(InventoryItemImage)
    private inventoryItemImageRepository: Repository<InventoryItemImage>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(
    createInventoryItemDto: CreateInventoryItemDto,
    companyId: string,
  ): Promise<InventoryItem> {
    const existingItem = await this.inventoryItemRepository.findOne({
      where: { sku: createInventoryItemDto.sku, companyId },
    });

    if (existingItem) {
      throw new BadRequestException('SKU already exists for this company');
    }

    const inventoryItem = this.inventoryItemRepository.create({
      ...createInventoryItemDto,
      companyId,
    });

    return await this.inventoryItemRepository.save(inventoryItem);
  }

  async findAll(
    companyId: string,
    queryDto: InventoryItemQueryDto,
  ): Promise<PaginatedResult<InventoryItem>> {
    const { page, limit, search, category, categoryId, status, location, tags, sortBy, sortOrder } = queryDto;

    const queryBuilder = this.inventoryItemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.images', 'images')
      .where('item.companyId = :companyId', { companyId });

    await this.applyFilters(queryBuilder, companyId, { search, category, categoryId, status, location, tags });

    // Apply sorting
    const allowedSortFields = ['name', 'sku', 'category', 'currentStock', 'createdAt', 'updatedAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`item.${sortField}`, sortOrder);

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, companyId: string): Promise<InventoryItem> {
    const item = await this.inventoryItemRepository.findOne({
      where: { id, companyId },
      relations: ['images'],
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    return item;
  }

  async update(
    id: string,
    updateInventoryItemDto: UpdateInventoryItemDto,
    companyId: string,
  ): Promise<InventoryItem> {
    const item = await this.findOne(id, companyId);

    // Check if SKU is being updated and if it conflicts
    if (updateInventoryItemDto.sku && updateInventoryItemDto.sku !== item.sku) {
      const existingItem = await this.inventoryItemRepository.findOne({
        where: { sku: updateInventoryItemDto.sku, companyId },
      });

      if (existingItem) {
        throw new BadRequestException('SKU already exists for this company');
      }
    }

    Object.assign(item, updateInventoryItemDto);
    return await this.inventoryItemRepository.save(item);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const item = await this.findOne(id, companyId);
    await this.inventoryItemRepository.remove(item);
  }

  async search(
    companyId: string,
    queryDto: InventoryItemQueryDto,
  ): Promise<PaginatedResult<InventoryItem>> {
    return this.findAll(companyId, queryDto);
  }

  async findLowStockItems(companyId: string): Promise<InventoryItem[]> {
    return await this.inventoryItemRepository.find({
      where: {
        companyId,
        isLowStock: true,
        status: In([InventoryItemStatus.ACTIVE]),
      },
      relations: ['images'],
      order: { currentStock: 'ASC' },
    });
  }

  async updateStock(
    id: string,
    newStock: number,
    companyId: string,
  ): Promise<InventoryItem> {
    const item = await this.findOne(id, companyId);
    item.currentStock = newStock;
    return await this.inventoryItemRepository.save(item);
  }

  async addImage(
    inventoryItemId: string,
    imageData: {
      filename: string;
      url: string;
      mimetype: string;
      size: number;
      isPrimary?: boolean;
    },
    companyId: string,
  ): Promise<InventoryItemImage> {
    const item = await this.findOne(inventoryItemId, companyId);
    if (imageData.isPrimary) {
      await this.inventoryItemImageRepository.update(
        { inventoryItemId },
        { isPrimary: false },
      );
    }

    const image = this.inventoryItemImageRepository.create({
      ...imageData,
      inventoryItemId,
    });

    return await this.inventoryItemImageRepository.save(image);
  }

  async removeImage(
    imageId: string,
    inventoryItemId: string,
    companyId: string,
  ): Promise<void> {
    await this.findOne(inventoryItemId, companyId);

    const image = await this.inventoryItemImageRepository.findOne({
      where: { id: imageId, inventoryItemId },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    await this.inventoryItemImageRepository.remove(image);
  }

  async getCategories(companyId: string): Promise<string[]> {
    const result = await this.inventoryItemRepository
      .createQueryBuilder('item')
      .select('DISTINCT item.category', 'category')
      .where('item.companyId = :companyId', { companyId })
      .getRawMany();

    return result.map(r => r.category).filter(Boolean);
  }

  async getLocations(companyId: string): Promise<string[]> {
    const result = await this.inventoryItemRepository
      .createQueryBuilder('item')
      .select('DISTINCT item.location', 'location')
      .where('item.companyId = :companyId', { companyId })
      .getRawMany();

    return result.map(r => r.location).filter(Boolean);
  }

  private async getCategoryAndDescendantNames(rootId: string, companyId: string): Promise<string[]> {
    const cats = await this.categoryRepository.find({ where: { companyId } });
    if (!cats.length) return [];

    const byId = new Map(cats.map(c => [c.id, c] as const));
    if (!byId.has(rootId)) return [];

    const childrenMap = new Map<string, string[]>();
    cats.forEach(c => {
      if (!c.parentId) return;
      const arr = childrenMap.get(c.parentId) ?? [];
      arr.push(c.id);
      childrenMap.set(c.parentId, arr);
    });

    const resultIds: string[] = [];
    const stack = [rootId];
    while (stack.length) {
      const id = stack.pop()!;
      resultIds.push(id);
      const kids = childrenMap.get(id) ?? [];
      kids.forEach(k => stack.push(k));
    }
    const names: string[] = [];
    resultIds.forEach(id => {
      const c = byId.get(id);
      if (c?.name) names.push(c.name);
    });
    return names;
  }

  private async applyFilters(
    queryBuilder: SelectQueryBuilder<InventoryItem>,
    companyId: string,
    filters: {
      search?: string;
      category?: string;
      categoryId?: string;
      status?: InventoryItemStatus;
      location?: string;
      tags?: string;
    },
  ): Promise<void> {
    const { search, category, categoryId, status, location, tags } = filters;

    if (search) {
      queryBuilder.andWhere(
        '(item.name ILIKE :search OR item.description ILIKE :search OR item.sku ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      const names = await this.getCategoryAndDescendantNames(categoryId, companyId);
      if (names.length > 0) {
        queryBuilder.andWhere('item.category IN (:...categories)', { categories: names });
      } else {
        queryBuilder.andWhere('1=0');
      }
    } else if (category) {
      queryBuilder.andWhere('item.category = :category', { category });
    }

    if (status) {
      queryBuilder.andWhere('item.status = :status', { status });
    }

    if (location) {
      queryBuilder.andWhere('item.location = :location', { location });
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      queryBuilder.andWhere('item.tags && :tags', { tags: tagArray });
    }
  }
}