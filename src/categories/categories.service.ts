import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InventoryItem } from '../inventory-items/inventory-item.entity';

export interface CategoryNode extends Category {
  children?: CategoryNode[];
  stats?: {
    itemsDirect: number;
    itemsWithDescendants: number;
  };
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(InventoryItem)
    private readonly itemRepo: Repository<InventoryItem>,
  ) {}

  async create(dto: CreateCategoryDto, companyId: string): Promise<Category> {
    await this.ensureNameUnique(dto.name, companyId);

    let parent: Category | null = null;
    if (dto.parentId) {
      parent = await this.categoryRepo.findOne({ where: { id: dto.parentId, companyId } });
      if (!parent) throw new BadRequestException('Parent category not found in your company');
    }

    const entity = this.categoryRepo.create({
      name: dto.name,
      description: dto.description,
      parentId: dto.parentId ?? null,
      companyId,
    });
    return this.categoryRepo.save(entity);
  }

  async findAll(companyId: string): Promise<CategoryNode[]> {
    const categories = await this.categoryRepo.find({ where: { companyId } });
    const itemsByCategory = await this.itemsCountByCategory(companyId);

    const map = new Map<string, CategoryNode>();
    categories.forEach((c) => map.set(c.id, { ...c, children: [] }));

    const roots: CategoryNode[] = [];
    map.forEach((node) => {
      node.stats = {
        itemsDirect: itemsByCategory.get(node.name) ?? 0,
        itemsWithDescendants: 0, // fill after tree built
      };
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    // compute cumulative stats
    const compute = (n: CategoryNode): number => {
      const sumChildren = (n.children ?? []).reduce((acc, ch) => acc + compute(ch), 0);
      const total = (n.stats?.itemsDirect ?? 0) + sumChildren;
      if (n.stats) n.stats.itemsWithDescendants = total;
      return total;
    };
    roots.forEach(compute);

    return roots;
  }

  async findOne(id: string, companyId: string): Promise<CategoryNode> {
    const cat = await this.categoryRepo.findOne({ where: { id, companyId } });
    if (!cat) throw new NotFoundException('Category not found');

    const tree = await this.findAll(companyId);
    const stack: CategoryNode[] = [...tree];
    while (stack.length) {
      const n = stack.pop()!;
      if (n.id === id) return n;
      (n.children ?? []).forEach((c) => stack.push(c));
    }
    return { ...cat } as CategoryNode;
  }

  async update(id: string, dto: UpdateCategoryDto, companyId: string): Promise<Category> {
    const cat = await this.categoryRepo.findOne({ where: { id, companyId } });
    if (!cat) throw new NotFoundException('Category not found');

    if (dto.name && dto.name !== cat.name) {
      await this.ensureNameUnique(dto.name, companyId);
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) throw new BadRequestException('A category cannot be its own parent');
      if (dto.parentId) {
        const parent = await this.categoryRepo.findOne({ where: { id: dto.parentId, companyId } });
        if (!parent) throw new BadRequestException('Parent category not found in your company');
        const isCircular = await this.isCircularReference(id, dto.parentId, companyId);
        if (isCircular) throw new BadRequestException('Circular category hierarchy detected');
      }
      cat.parentId = dto.parentId ?? null;
    }

    if (dto.name) cat.name = dto.name;
    if (dto.description !== undefined) cat.description = dto.description ?? null;

    return this.categoryRepo.save(cat);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const cat = await this.categoryRepo.findOne({ where: { id, companyId } });
    if (!cat) throw new NotFoundException('Category not found');
    await this.categoryRepo.remove(cat);
  }

  async getChildren(id: string, companyId: string): Promise<Category[]> {
    const exists = await this.categoryRepo.findOne({ where: { id, companyId } });
    if (!exists) throw new NotFoundException('Category not found');
    return this.categoryRepo.find({ where: { parentId: id, companyId } });
  }

  async getTree(companyId: string): Promise<CategoryNode[]> {
    return this.findAll(companyId);
  }

  private async ensureNameUnique(name: string, companyId: string): Promise<void> {
    const exists = await this.categoryRepo.findOne({ where: { name, companyId } });
    if (exists) throw new BadRequestException('Category name must be unique per company');
  }

  private async isCircularReference(id: string, newParentId: string, companyId: string): Promise<boolean> {
    let current: Category | null | undefined = await this.categoryRepo.findOne({ where: { id: newParentId, companyId } });
    while (current && current.parentId) {
      if (current.parentId === id) return true;
      current = await this.categoryRepo.findOne({ where: { id: current.parentId, companyId } });
    }
    return false;
  }

  private async itemsCountByCategory(companyId: string): Promise<Map<string, number>> {
    const rows = await this.itemRepo
      .createQueryBuilder('item')
      .select('item.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('item.companyId = :companyId', { companyId })
      .groupBy('item.category')
      .getRawMany<{ category: string; count: string }>();

    const map = new Map<string, number>();
    rows.forEach((r) => {
      if (r.category) map.set(r.category, parseInt(r.count, 10));
    });
    return map;
  }
}
