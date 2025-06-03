import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Repository,
  FindOptionsWhere,
  FindManyOptions,
  UpdateResult,
  DeleteResult,
} from "typeorm";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductFilterDto } from "./dto/product-filter.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product, ProductType } from "./entities/product.entity";

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.repository.create(createProductDto);
    return this.repository.save(product);
  }

  async findAll(filterDto?: ProductFilterDto): Promise<Product[]> {
    const options: FindManyOptions<Product> = {
      order: { createdAt: "DESC" },
    };

    if (filterDto) {
      const where: FindOptionsWhere<Product> = {};

      if (filterDto.type) {
        where.type = filterDto.type;
      }

      if (filterDto.brand) {
        where.brand = filterDto.brand;
      }

      if (filterDto.isActive !== undefined) {
        where.isActive = filterDto.isActive;
      }

      if (filterDto.isVisible !== undefined) {
        where.isVisible = filterDto.isVisible;
      }

      if (filterDto.isFeatured !== undefined) {
        where.isFeatured = filterDto.isFeatured;
      }

      if (filterDto.size) {
        where.size = filterDto.size;
      }

      if (filterDto.absorbencyLevel) {
        where.absorbencyLevel = filterDto.absorbencyLevel;
      }

      if (filterDto.ageGroup) {
        where.ageGroup = filterDto.ageGroup;
      }

      if (filterDto.isOrganic !== undefined) {
        where.isOrganic = filterDto.isOrganic;
      }

      if (filterDto.isHypoallergenic !== undefined) {
        where.isHypoallergenic = filterDto.isHypoallergenic;
      }

      options.where = where;
    }

    return this.repository.find(options);
  }

  async findOne(id: string): Promise<Product | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.repository.findOne({ where: { sku } });
  }

  async findByBarcode(barcode: string): Promise<Product | null> {
    return this.repository.findOne({ where: { barcode } });
  }

  async findByType(type: ProductType): Promise<Product[]> {
    return this.repository.find({
      where: { type, isActive: true, isVisible: true },
      order: { createdAt: "DESC" },
    });
  }

  async findByBrand(brand: string): Promise<Product[]> {
    return this.repository.find({
      where: { brand, isActive: true, isVisible: true },
      order: { name: "ASC" },
    });
  }

  async findFeatured(): Promise<Product[]> {
    return this.repository.find({
      where: { isFeatured: true, isActive: true, isVisible: true },
      order: { createdAt: "DESC" },
    });
  }

  async findLowStock(): Promise<Product[]> {
    return this.repository
      .createQueryBuilder("product")
      .where("product.isActive = :isActive", { isActive: true })
      .andWhere("product.trackInventory = :trackInventory", {
        trackInventory: true,
      })
      .andWhere(
        "(product.stockQuantity - product.reservedQuantity) <= product.lowStockThreshold"
      )
      .orderBy("product.stockQuantity", "ASC")
      .getMany();
  }

  async findOutOfStock(): Promise<Product[]> {
    return this.repository
      .createQueryBuilder("product")
      .where("product.isActive = :isActive", { isActive: true })
      .andWhere("product.trackInventory = :trackInventory", {
        trackInventory: true,
      })
      .andWhere("product.stockQuantity <= product.reservedQuantity")
      .orderBy("product.name", "ASC")
      .getMany();
  }

  async searchByName(searchTerm: string): Promise<Product[]> {
    return this.repository
      .createQueryBuilder("product")
      .where("product.name ILIKE :searchTerm", {
        searchTerm: `%${searchTerm}%`,
      })
      .andWhere("product.isActive = :isActive", { isActive: true })
      .andWhere("product.isVisible = :isVisible", { isVisible: true })
      .orderBy("product.name", "ASC")
      .getMany();
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto
  ): Promise<Product | null> {
    await this.repository.update(id, updateProductDto);
    return this.findOne(id);
  }

  async updateStock(
    id: string,
    stockQuantity: number
  ): Promise<Product | null> {
    await this.repository.update(id, { stockQuantity });
    return this.findOne(id);
  }

  async reserveStock(id: string, quantity: number): Promise<boolean> {
    const result = await this.repository
      .createQueryBuilder()
      .update(Product)
      .set({ reservedQuantity: () => "reservedQuantity + :quantity" })
      .where("id = :id", { id })
      .andWhere("(stockQuantity - reservedQuantity) >= :quantity", { quantity })
      .setParameters({ quantity })
      .execute();

    return result.affected > 0;
  }

  async releaseStock(id: string, quantity: number): Promise<boolean> {
    const result = await this.repository
      .createQueryBuilder()
      .update(Product)
      .set({
        reservedQuantity: () => "GREATEST(0, reservedQuantity - :quantity)",
      })
      .where("id = :id", { id })
      .setParameters({ quantity })
      .execute();

    return result.affected > 0;
  }

  async softDelete(id: string): Promise<UpdateResult> {
    return this.repository.update(id, {
      isActive: false,
      discontinuedAt: new Date(),
    });
  }

  async hardDelete(id: string): Promise<DeleteResult> {
    return this.repository.delete(id);
  }

  async count(filterDto?: ProductFilterDto): Promise<number> {
    if (!filterDto) {
      return this.repository.count();
    }

    const where: FindOptionsWhere<Product> = {};

    if (filterDto.type) where.type = filterDto.type;
    if (filterDto.brand) where.brand = filterDto.brand;
    if (filterDto.isActive !== undefined) where.isActive = filterDto.isActive;
    if (filterDto.isVisible !== undefined)
      where.isVisible = filterDto.isVisible;

    return this.repository.count({ where });
  }

  async getBrandsList(): Promise<string[]> {
    const result = await this.repository
      .createQueryBuilder("product")
      .select("DISTINCT product.brand", "brand")
      .where("product.isActive = :isActive", { isActive: true })
      .orderBy("product.brand", "ASC")
      .getRawMany();

    return result.map((item) => item.brand);
  }

  async getStockSummary(): Promise<{
    totalProducts: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
  }> {
    const totalProducts = await this.repository.count({
      where: { isActive: true },
    });

    const lowStock = await this.repository
      .createQueryBuilder("product")
      .where("product.isActive = :isActive", { isActive: true })
      .andWhere("product.trackInventory = :trackInventory", {
        trackInventory: true,
      })
      .andWhere(
        "(product.stockQuantity - product.reservedQuantity) <= product.lowStockThreshold"
      )
      .andWhere("(product.stockQuantity - product.reservedQuantity) > 0")
      .getCount();

    const outOfStock = await this.repository
      .createQueryBuilder("product")
      .where("product.isActive = :isActive", { isActive: true })
      .andWhere("product.trackInventory = :trackInventory", {
        trackInventory: true,
      })
      .andWhere("product.stockQuantity <= product.reservedQuantity")
      .getCount();

    return {
      totalProducts,
      inStock: totalProducts - lowStock - outOfStock,
      lowStock,
      outOfStock,
    };
  }
}
