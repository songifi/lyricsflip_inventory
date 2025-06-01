import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	UseInterceptors,
	UploadedFiles,
	BadRequestException,
	ParseUUIDPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import {
	BulkCreateProductDto,
	BulkDeleteProductDto,
	BulkUpdateStockDto,
} from './dto/bulk-product.dto';

@Controller('products')
export class ProductController {
	constructor(private readonly productService: ProductService) {}

	@Post()
	create(@Body() createProductDto: CreateProductDto) {
		return this.productService.create(createProductDto);
	}

	@Get()
	findAll(@Query() query: ProductQueryDto) {
		return this.productService.findAll(query);
	}

	@Get('categories')
	getCategories() {
		return this.productService.getCategories();
	}

	@Get('brands')
	getBrands() {
		return this.productService.getBrands();
	}

	@Get(':id')
	findOne(@Param('id', ParseUUIDPipe) id: string) {
		return this.productService.findOne(id);
	}

	@Patch(':id')
	update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() updateProductDto: UpdateProductDto
	) {
		return this.productService.update(id, updateProductDto);
	}

	@Delete(':id')
	remove(@Param('id', ParseUUIDPipe) id: string) {
		return this.productService.remove(id);
	}

	// Image upload endpoints
	@Post(':id/images')
	@UseInterceptors(
		FilesInterceptor('images', 5, {
			storage: diskStorage({
				destination: './uploads',
				filename: (req, file, cb) => {
					const uniqueSuffix =
						Date.now() + '-' + Math.round(Math.random() * 1e9);
					cb(
						null,
						`${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`
					);
				},
			}),
			fileFilter: (req, file, cb) => {
				if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
					return cb(
						new BadRequestException('Only image files are allowed!'),
						false
					);
				}
				cb(null, true);
			},
			limits: {
				fileSize: 5 * 1024 * 1024, // 5MB
			},
		})
	)
	uploadImages(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFiles() files: Express.Multer.File[]
	) {
		if (!files || files.length === 0) {
			throw new BadRequestException('No files uploaded');
		}
		return this.productService.uploadImages(id, files);
	}

	@Delete(':id/images')
	removeImage(
		@Param('id', ParseUUIDPipe) id: string,
		@Body('imageUrl') imageUrl: string
	) {
		if (!imageUrl) {
			throw new BadRequestException('Image URL is required');
		}
		return this.productService.removeImage(id, imageUrl);
	}

	// Bulk operations
	@Post('bulk')
	bulkCreate(@Body() bulkCreateDto: BulkCreateProductDto) {
		return this.productService.bulkCreate(bulkCreateDto);
	}

	@Delete('bulk')
	bulkDelete(@Body() bulkDeleteDto: BulkDeleteProductDto) {
		return this.productService.bulkDelete(bulkDeleteDto);
	}

	@Patch('bulk/stock')
	bulkUpdateStock(@Body() bulkUpdateStockDto: BulkUpdateStockDto) {
		return this.productService.bulkUpdateStock(bulkUpdateStockDto);
	}
}
