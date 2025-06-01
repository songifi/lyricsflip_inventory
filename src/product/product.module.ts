import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from './entities/product.entity';
import * as fs from 'fs';

@Module({
	imports: [
		TypeOrmModule.forFeature([Product]),
		MulterModule.register({
			dest: './uploads',
		}),
	],
	controllers: [ProductController],
	providers: [ProductService],
	exports: [ProductService],
})
export class ProductModule {
	constructor() {
		// Ensure uploads directory exists
		if (!fs.existsSync('./uploads')) {
			fs.mkdirSync('./uploads', { recursive: true });
		}
	}
}
