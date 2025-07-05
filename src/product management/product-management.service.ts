import { Injectable, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Product } from "../entities/product.entity"
import type { ProductImage } from "../entities/product-image.entity"
import type { CreateProductDto } from "../dto/create-product.dto"
import type { UpdateProductDto } from "../dto/update-product.dto"
import type { ProductQueryDto } from "../dto/product-query.dto"
import type { BulkCreateProductDto, BulkUpdateProductDto, BulkDeleteProductDto } from "../dto/bulk-product.dto"
import type { Express } from "express"

@Injectable()
export class ProductService {
  constructor(
    private productRepository: Repository<Product>,
    private productImageRepository: Repository<ProductImage>,
  ) {}

  // CRUD Operations
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto)
    return await this.productRepository.save(product)
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find({
      relations: ["images"],
      order: { createdAt: "DESC" },
    })
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ["images"],
    })

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    return product
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id)
    Object.assign(product, updateProductDto)
    return await this.productRepository.save(product)
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id)
    await this.productRepository.remove(product)
  }

  // Search and Filtering
  async searchProducts(
    query: ProductQueryDto,
  ): Promise<{ products: Product[]; total: number; page: number; totalPages: number }> {
    const queryBuilder = this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.images", "images")

    // Search by name or description
    if (query.search) {
      queryBuilder.andWhere("(product.name ILIKE :search OR product.description ILIKE :search)", {
        search: `%${query.search}%`,
      })
    }

    // Filter by category
    if (query.category) {
      queryBuilder.andWhere("product.category = :category", { category: query.category })
    }

    // Filter by brand
    if (query.brand) {
      queryBuilder.andWhere("product.brand = :brand", { brand: query.brand })
    }

    // Filter by price range
    if (query.minPrice !== undefined) {
      queryBuilder.andWhere("product.price >= :minPrice", { minPrice: query.minPrice })
    }
    if (query.maxPrice !== undefined) {
      queryBuilder.andWhere("product.price <= :maxPrice", { maxPrice: query.maxPrice })
    }

    // Filter by active status
    if (query.isActive !== undefined) {
      queryBuilder.andWhere("product.isActive = :isActive", { isActive: query.isActive })
    }

    // Sorting
    queryBuilder.orderBy(`product.${query.sortBy}`, query.sortOrder)

    // Pagination
    const skip = (query.page - 1) * query.limit
    queryBuilder.skip(skip).take(query.limit)

    const [products, total] = await queryBuilder.getManyAndCount()
    const totalPages = Math.ceil(total / query.limit)

    return {
      products,
      total,
      page: query.page,
      totalPages,
    }
  }

  // Bulk Operations
  async bulkCreate(bulkCreateDto: BulkCreateProductDto): Promise<Product[]> {
    const products = this.productRepository.create(bulkCreateDto.products)
    return await this.productRepository.save(products)
  }

  async bulkUpdate(bulkUpdateDto: BulkUpdateProductDto): Promise<Product[]> {
    const updatedProducts: Product[] = []

    for (const item of bulkUpdateDto.products) {
      const { id, ...updateData } = item
      const product = await this.findOne(id)
      Object.assign(product, updateData)
      const updated = await this.productRepository.save(product)
      updatedProducts.push(updated)
    }

    return updatedProducts
  }

  async bulkDelete(bulkDeleteDto: BulkDeleteProductDto): Promise<{ deleted: number }> {
    const result = await this.productRepository.delete(bulkDeleteDto.ids)
    return { deleted: result.affected || 0 }
  }

  // Image Management
  async uploadImages(productId: string, files: Express.Multer.File[]): Promise<ProductImage[]> {
    const product = await this.findOne(productId)
    const images: ProductImage[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      // In a real implementation, you would upload to cloud storage (AWS S3, Cloudinary, etc.)
      const imageUrl = `/uploads/products/${Date.now()}-${file.originalname}`

      const image = this.productImageRepository.create({
        url: imageUrl,
        altText: `${product.name} image ${i + 1}`,
        sortOrder: i,
        isPrimary: i === 0, // First image is primary
        productId: product.id,
      })

      images.push(await this.productImageRepository.save(image))
    }

    return images
  }

  async deleteImage(productId: string, imageId: string): Promise<void> {
    const image = await this.productImageRepository.findOne({
      where: { id: imageId, productId },
    })

    if (!image) {
      throw new NotFoundException(`Image with ID ${imageId} not found for product ${productId}`)
    }

    await this.productImageRepository.remove(image)
  }
}
