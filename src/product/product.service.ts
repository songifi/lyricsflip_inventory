import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product, ProductStatus } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import {
  BulkCreateProductDto,
  BulkDeleteProductDto,
  BulkUpdateStockDto,
  BulkUpdateStatusDto,
  BulkUpdatePriceDto,
  BulkUpdateVisibilityDto,
  BulkUpdateCategoryDto,
  BulkImportProductsDto,
} from './dto/bulk-product.dto';
import * as fs from 'fs';
import * as path from 'path';
import { BarcodeService } from './barcode.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Readable } from 'stream';
import * as csv from 'csv-parser';
import * as XLSX from 'xlsx';

interface BulkOperationResult<T = any> {
  success: T[];
  failures: Array<{ item: any; error: string }>;
}

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly barcodeService: BarcodeService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Check if product with same SKU already exists
    if (createProductDto.sku) {
      const existingProductBySku = await this.productRepository.findOne({ where: { sku: createProductDto.sku } });
      if (existingProductBySku) {
        throw new ConflictException(`Product with SKU ${createProductDto.sku} already exists`);
      }
    }

    // Check if product with same barcode already exists
    if (createProductDto.barcode) {
      const existingProductByBarcode = await this.productRepository.findOne({ where: { barcode: createProductDto.barcode } });
      if (existingProductByBarcode) {
        throw new ConflictException(`Product with barcode ${createProductDto.barcode} already exists`);
      }
    }

    // Set default values if not provided
    if (!createProductDto.status) {
      createProductDto.status = ProductStatus.DRAFT;
    }

    if (createProductDto.status === ProductStatus.PUBLISHED && !createProductDto.publishedAt) {
      createProductDto.publishedAt = new Date();
    }

    if (!createProductDto.lowStockThreshold && createProductDto.lowStockThreshold !== 0) {
      createProductDto.lowStockThreshold = 5;
    }

    // Create and save the product
    const product = this.productRepository.create(createProductDto);
    const savedProduct = await this.productRepository.save(product);

    // Emit event for product creation
    this.eventEmitter.emit('product.created', savedProduct);

    return savedProduct;
  }
  
  async bulkCreate(bulkCreateDto: BulkCreateProductDto): Promise<{ success: Product[]; failures: any[] }> {
    const results = {
      success: [],
      failures: [],
    };

    for (const productDto of bulkCreateDto.products) {
      try {
        const product = await this.create(productDto);
        results.success.push(product);
      } catch (error) {
        results.failures.push({
          product: productDto,
          error: error.message || 'Unknown error',
        });
      }
    }

    return results;
  }

  async bulkDelete(bulkDeleteDto: BulkDeleteProductDto): Promise<{ success: string[]; failures: any[] }> {
    const results = {
      success: [],
      failures: [],
    };

    for (const id of bulkDeleteDto.ids) {
      try {
        await this.remove(id);
        results.success.push(id);
      } catch (error) {
        results.failures.push({
          id,
          error: error.message || 'Unknown error',
        });
      }
    }

    return results;
  }

  async findAll(query: ProductQueryDto) {
    const {
      search,
      category,
      brand,
      manufacturer,
      model,
      minPrice,
      maxPrice,
      isActive,
      isVisible,
      isFeatured,
      status,
      condition,
      sku,
      barcode,
      supplierId,
      tags,
      lowStock,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
      publishedAfter,
      publishedBefore,
      location,
      sortBy,
      sortOrder,
      limit = 100,
      page = 1,
    } = query;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    // Search functionality - search across multiple fields
    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search OR product.sku ILIKE :search OR product.barcode ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Category filter
    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    // Brand filter
    if (brand) {
      queryBuilder.andWhere('product.brand = :brand', { brand });
    }

    // Manufacturer filter
    if (manufacturer) {
      queryBuilder.andWhere('product.manufacturer = :manufacturer', { manufacturer });
    }

    // Model filter
    if (model) {
      queryBuilder.andWhere('product.model = :model', { model });
    }

    // Price range filter
    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Status filters
    if (isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive });
    }

    if (isVisible !== undefined) {
      queryBuilder.andWhere('product.isVisible = :isVisible', { isVisible });
    }

    if (isFeatured !== undefined) {
      queryBuilder.andWhere('product.isFeatured = :isFeatured', { isFeatured });
    }

    // Product status filter (enum)
    if (status && status.length > 0) {
      queryBuilder.andWhere('product.status IN (:...status)', { status });
    }

    // Product condition filter (enum)
    if (condition && condition.length > 0) {
      queryBuilder.andWhere('product.condition IN (:...condition)', { condition });
    }

    // SKU filter
    if (sku) {
      queryBuilder.andWhere('product.sku = :sku', { sku });
    }

    // Barcode filter
    if (barcode) {
      queryBuilder.andWhere('product.barcode = :barcode', { barcode });
    }

    // Supplier filter
    if (supplierId) {
      queryBuilder.andWhere('product.supplierId = :supplierId', { supplierId });
    }

    // Tags filter
    if (tags && tags.length > 0) {
      queryBuilder.andWhere('product.tags @> :tags', { tags: JSON.stringify(tags) });
    }

    // Low stock filter
    if (lowStock) {
      queryBuilder.andWhere(
        'product.stock <= COALESCE(product.lowStockThreshold, 5)'
      );
    }

    // Date range filters
    if (createdAfter) {
      queryBuilder.andWhere('product.createdAt >= :createdAfter', {
        createdAfter: new Date(createdAfter),
      });
    }
    if (createdBefore) {
      queryBuilder.andWhere('product.createdAt <= :createdBefore', {
        createdBefore: new Date(createdBefore),
      });
    }
    if (updatedAfter) {
      queryBuilder.andWhere('product.updatedAt >= :updatedAfter', {
        updatedAfter: new Date(updatedAfter),
      });
    }
    if (updatedBefore) {
      queryBuilder.andWhere('product.updatedAt <= :updatedBefore', {
        updatedBefore: new Date(updatedBefore),
      });
    }
    if (publishedAfter) {
      queryBuilder.andWhere('product.publishedAt >= :publishedAfter', {
        publishedAfter: new Date(publishedAfter),
      });
    }
    if (publishedBefore) {
      queryBuilder.andWhere('product.publishedAt <= :publishedBefore', {
        publishedBefore: new Date(publishedBefore),
      });
    }

    // Location filter
    if (location) {
      queryBuilder.andWhere(
        'product.location ILIKE :location',
        { location: `%${location}%` }
      );
    }

    // Sorting
    const allowedSortFields = [
      'name',
      'price',
      'compareAtPrice',
      'costPrice',
      'stock',
      'sku',
      'barcode',
      'createdAt',
      'updatedAt',
      'publishedAt',
      'status',
      'condition',
      'brand',
      'category',
    ];

    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`product.${sortField}`, sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC');

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.take(limit).skip(offset);

    const [products, total] = await queryBuilder.getManyAndCount();

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    // Check if SKU is being changed and if it already exists
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingProductBySku = await this.productRepository.findOne({
        where: { sku: updateProductDto.sku },
      });
      if (existingProductBySku && existingProductBySku.id !== id) {
        throw new ConflictException(`Product with SKU ${updateProductDto.sku} already exists`);
      }
    }

    // Check if barcode is being changed and if it already exists
    if (updateProductDto.barcode && updateProductDto.barcode !== product.barcode) {
      const existingProductByBarcode = await this.productRepository.findOne({
        where: { barcode: updateProductDto.barcode },
      });
      if (existingProductByBarcode && existingProductByBarcode.id !== id) {
        throw new ConflictException(`Product with barcode ${updateProductDto.barcode} already exists`);
      }
    }

    // Handle status change to PUBLISHED
    if (updateProductDto.status === ProductStatus.PUBLISHED && product.status !== ProductStatus.PUBLISHED) {
      updateProductDto.publishedAt = new Date();
    }

    // Update the product
    Object.assign(product, updateProductDto);
    const updatedProduct = await this.productRepository.save(product);

    // Emit event for product update
    this.eventEmitter.emit('product.updated', updatedProduct);

    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    
    // Emit event for product deletion
    this.eventEmitter.emit('product.deleted', { id });
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.productRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.category', 'category')
      .where('product.category IS NOT NULL')
      .getRawMany();
    
    return categories.map(item => item.category).filter(Boolean);
  }

  async getBrands(): Promise<string[]> {
    const brands = await this.productRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.brand', 'brand')
      .where('product.brand IS NOT NULL')
      .getRawMany();
    
    return brands.map(item => item.brand).filter(Boolean);
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Check if product with same SKU already exists
    if (createProductDto.sku) {
      const existingProductBySku = await this.productRepository.findOne({
        where: { sku: createProductDto.sku },
      });
      if (existingProductBySku) {
        throw new ConflictException(`Product with SKU ${createProductDto.sku} already exists`);
      }
    }

    // Check if product with same barcode already exists
    if (createProductDto.barcode) {
      const existingProductByBarcode = await this.productRepository.findOne({
        where: { barcode: createProductDto.barcode },
      });
      if (existingProductByBarcode) {
        throw new ConflictException(`Product with barcode ${createProductDto.barcode} already exists`);
      }
    }

    // Set default values for lifecycle fields
    if (!createProductDto.status) {
      createProductDto.status = ProductStatus.DRAFT;
    }
    
    if (createProductDto.status === ProductStatus.PUBLISHED && !createProductDto.publishedAt) {
      createProductDto.publishedAt = new Date();
    }
    
    if (createProductDto.lowStockThreshold === undefined) {
      createProductDto.lowStockThreshold = 5;
    }

    // Create and save the product
    const product = this.productRepository.create(createProductDto);
    const savedProduct = await this.productRepository.save(product);
    
    // Emit product created event
    this.eventEmitter.emit('product.created', savedProduct);
    
    return savedProduct;
  }
	constructor(
		@InjectRepository(Product)

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Check if product with same SKU or barcode already exists
    if (createProductDto.sku) {
      const existingProductBySku = await this.productRepository.findOne({
        where: { sku: createProductDto.sku },
      });
      if (existingProductBySku) {
        throw new ConflictException(`Product with SKU ${createProductDto.sku} already exists`);
      }
    }

    if (createProductDto.barcode) {
      const existingProductByBarcode = await this.productRepository.findOne({
        where: { barcode: createProductDto.barcode },
      });
      if (existingProductByBarcode) {
        throw new ConflictException(`Product with barcode ${createProductDto.barcode} already exists`);
      }
    }
			category,
			brand,
			manufacturer,
			model,
			minPrice,
			maxPrice,
			isActive,
			isVisible,
			isFeatured,
			status,
			condition,
			sku,
			barcode,
			supplierId,
			tags,
			lowStock,
			createdAfter,
			createdBefore,
			updatedAfter,
			updatedBefore,
			publishedAfter,
			publishedBefore,
			location,
			sortBy,
			sortOrder,
			limit = 100,
			page = 1,
		} = query;

		const queryBuilder = this.productRepository.createQueryBuilder('product');

		// Search functionality - search across multiple fields
		if (search) {
			queryBuilder.andWhere(
				'(product.name ILIKE :search OR product.description ILIKE :search OR product.sku ILIKE :search OR product.barcode ILIKE :search)',
				{ search: `%${search}%` }
			);
		}

		// Category filter
		if (category) {
			queryBuilder.andWhere('product.category = :category', { category });
		}

		// Brand filter
		if (brand) {
			queryBuilder.andWhere('product.brand = :brand', { brand });
		}

		// Manufacturer filter
		if (manufacturer) {
			queryBuilder.andWhere('product.manufacturer = :manufacturer', { manufacturer });
		}

		// Model filter
		if (model) {
			queryBuilder.andWhere('product.model = :model', { model });
		}

		// Price range filter
		if (minPrice !== undefined) {
			queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
		}
		if (maxPrice !== undefined) {
			queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
		}

		// Status filters
		if (isActive !== undefined) {
			queryBuilder.andWhere('product.isActive = :isActive', { isActive });
		}

		if (isVisible !== undefined) {
			queryBuilder.andWhere('product.isVisible = :isVisible', { isVisible });
		}

		if (isFeatured !== undefined) {
			queryBuilder.andWhere('product.isFeatured = :isFeatured', { isFeatured });
		}

		// Product status filter (enum)
		if (status && status.length > 0) {
			queryBuilder.andWhere('product.status IN (:...status)', { status });
		}

		// Product condition filter (enum)
		if (condition && condition.length > 0) {
			queryBuilder.andWhere('product.condition IN (:...condition)', { condition });
		}

		// SKU filter
		if (sku) {
			queryBuilder.andWhere('product.sku = :sku', { sku });
		}

		// Barcode filter
		if (barcode) {
			queryBuilder.andWhere('product.barcode = :barcode', { barcode });
		}

		// Supplier filter
		if (supplierId) {
			queryBuilder.andWhere('product.supplierId = :supplierId', { supplierId });
		}

		// Tags filter
		if (tags) {
			const tagArray = tags.split(',').map((tag) => tag.trim());
			queryBuilder.andWhere('product.tags && :tags', { tags: tagArray });
		}

		// Low stock filter
		if (lowStock) {
			queryBuilder.andWhere(
				'(product.stock - product.reservedStock) <= product.lowStockThreshold'
			);
		}

		// Date range filters
		if (createdAfter) {
			queryBuilder.andWhere('product.createdAt >= :createdAfter', { 
				createdAfter: new Date(createdAfter) 
			});
		}

		if (createdBefore) {
			queryBuilder.andWhere('product.createdAt <= :createdBefore', { 
				createdBefore: new Date(createdBefore) 
			});
		}

		if (updatedAfter) {
			queryBuilder.andWhere('product.updatedAt >= :updatedAfter', { 
				updatedAfter: new Date(updatedAfter) 
			});
		}

		if (updatedBefore) {
			queryBuilder.andWhere('product.updatedAt <= :updatedBefore', { 
				updatedBefore: new Date(updatedBefore) 
			});
		}

		if (publishedAfter) {
			queryBuilder.andWhere('product.publishedAt >= :publishedAfter', { 
				publishedAfter: new Date(publishedAfter) 
			});
		}

		if (publishedBefore) {
			queryBuilder.andWhere('product.publishedAt <= :publishedBefore', { 
				publishedBefore: new Date(publishedBefore) 
			});
		}

		// Location filter
		if (location) {
			queryBuilder.andWhere('product.location ILIKE :location', { 
				location: `%${location}%` 
			});
		}

		// Sorting
		const allowedSortFields = [
			'name',
			'price',
			'createdAt',
			'updatedAt',
			'stock',
			'sku',
			'status',
			'publishedAt',
			'discontinuedAt',
			'brand',
			'category',
			'manufacturer',
		];
		const sortField = allowedSortFields.includes(`${sortBy}`) ? sortBy : 'createdAt';
		queryBuilder.orderBy(`product.${sortField}`, sortOrder);

		// Pagination
		const offset = (page - 1) * limit;
		queryBuilder.skip(offset).take(limit);

		const [products, total] = await queryBuilder.getManyAndCount();

		return {
			data: products,
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	async findOne(id: string): Promise<Product> {
		const product = await this.productRepository.findOne({ where: { id } });
		if (!product) {
			throw new NotFoundException(`Product with ID ${id} not found`);
		}
		return product;
	}

	async update(
		id: string,
		updateProductDto: UpdateProductDto
	): Promise<Product> {
		const product = await this.findOne(id);
		Object.assign(product, updateProductDto);
		return await this.productRepository.save(product);
	}

	async remove(id: string): Promise<void> {
		const product = await this.findOne(id);
		await this.productRepository.remove(product);
	}

	async uploadImages(
		id: string,
		files: Express.Multer.File[]
	): Promise<Product> {
		const product = await this.findOne(id);

		const imageUrls = files.map((file) => `/uploads/${file.filename}`);
		product.images = [...(product.images || []), ...imageUrls];

		return await this.productRepository.save(product);
	}

	async removeImage(id: string, imageUrl: string): Promise<Product> {
		const product = await this.findOne(id);

		if (!product.images || !product.images.includes(imageUrl)) {
			throw new BadRequestException('Image not found for this product');
		}

		// Remove from filesystem
		const imagePath = path.join(
			process.cwd(),
			'uploads',
			path.basename(imageUrl)
		);
		if (fs.existsSync(imagePath)) {
			fs.unlinkSync(imagePath);
		}

		// Remove from product
		product.images = product.images.filter((img) => img !== imageUrl);
		return await this.productRepository.save(product);
	}

	// Bulk Operations
	async bulkCreate(bulkCreateDto: BulkCreateProductDto): Promise<Product[]> {
		const products = this.productRepository.create(bulkCreateDto.products);
		return await this.productRepository.save(products);
	}

	async bulkDelete(bulkDeleteDto: BulkDeleteProductDto): Promise<void> {
		const result = await this.productRepository.delete({
			id: In(bulkDeleteDto.ids),
		});
		if (result.affected === 0) {
			throw new NotFoundException('No products found with the provided IDs');
		}
	}

	async bulkUpdateStock(
		bulkUpdateStockDto: BulkUpdateStockDto
	): Promise<Product[]> {
		const updates = bulkUpdateStockDto.items;
		const ids = updates.map((item) => item.id);

		const products = await this.productRepository.find({
			where: { id: In(ids) },
		});

		if (products.length !== ids.length) {
			throw new BadRequestException('Some products not found');
		}

		const updatedProducts = products.map((product) => {
			const update = updates.find((item) => item.id === product.id);
			if (update) {
				product.stock = update.stock;
			}
			return product;
		});

		return await this.productRepository.save(updatedProducts);
	}

	async getCategories(): Promise<string[]> {
		const result = await this.productRepository
			.createQueryBuilder('product')
			.select('DISTINCT product.category', 'category')
			.where('product.category IS NOT NULL')
			.getRawMany();

		return result.map((item) => item.category);
	}

	async getBrands(): Promise<string[]> {
		const result = await this.productRepository
			.createQueryBuilder('product')
			.select('DISTINCT product.brand', 'brand')
			.where('product.brand IS NOT NULL')
			.getRawMany();

		return result.map((item) => item.brand);
	}

	async createProduct(data: CreateProductDto): Promise<Product> {
		const barcode = await this.barcodeService.generateProductBarcode();
	
		const product = this.productRepository.create({ ...data, barcode });
		return this.productRepository.save(product);
	  }

	  async findProductByBarcode(barcode: string): Promise<Product> {
		const product = await this.productRepository.findOneBy({ barcode });
		if (!product) {
		  throw new NotFoundException(`Product with barcode ${barcode} not found`);
		}
		return product;
	  }
	  
	  
}
