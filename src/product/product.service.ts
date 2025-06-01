import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import {
	BulkCreateProductDto,
	BulkDeleteProductDto,
	BulkUpdateStockDto,
} from './dto/bulk-product.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProductService {
	constructor(
		@InjectRepository(Product)
		private productRepository: Repository<Product>
	) {}

	async create(createProductDto: CreateProductDto): Promise<Product> {
		const product = this.productRepository.create(createProductDto);
		return await this.productRepository.save(product);
	}

	async findAll(query: ProductQueryDto) {
		const {
			search,
			category,
			brand,
			minPrice,
			maxPrice,
			isActive,
			tags,
			sortBy,
			sortOrder,
			limit = 100,
			page = 1,
		} = query;

		const queryBuilder = this.productRepository.createQueryBuilder('product');

		// Search functionality
		if (search) {
			queryBuilder.andWhere(
				'(product.name ILIKE :search OR product.description ILIKE :search)',
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

		// Price range filter
		if (minPrice !== undefined) {
			queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
		}
		if (maxPrice !== undefined) {
			queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
		}

		// Active status filter
		if (isActive !== undefined) {
			queryBuilder.andWhere('product.isActive = :isActive', { isActive });
		}

		// Tags filter
		if (tags) {
			const tagArray = tags.split(',').map((tag) => tag.trim());
			queryBuilder.andWhere('product.tags && :tags', { tags: tagArray });
		}

		// Sorting
		const allowedSortFields = [
			'name',
			'price',
			'createdAt',
			'updatedAt',
			'stock',
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
}
