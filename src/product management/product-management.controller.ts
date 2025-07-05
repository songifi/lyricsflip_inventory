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
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from "@nestjs/common"
import { FilesInterceptor } from "@nestjs/platform-express"
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from "@nestjs/swagger"
import type { ProductService } from "./product-management.service"
import type { CreateProductDto } from "./dto/create-product.dto"
import type { UpdateProductDto } from "./dto/update-product.dto"
import type { ProductQueryDto } from "./dto/product-query.dto"
import type { BulkCreateProductDto, BulkUpdateProductDto, BulkDeleteProductDto } from "./dto/bulk-product.dto"

@ApiTags("products")
@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // CRUD Endpoints
  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all products" })
  @ApiResponse({ status: 200, description: "Products retrieved successfully" })
  async findAll() {
    return await this.productService.findAll()
  }

  @Get('search')
  @ApiOperation({ summary: 'Search and filter products' })
  @ApiResponse({ status: 200, description: 'Products search results' })
  async searchProducts(@Query() query: ProductQueryDto) {
    return await this.productService.searchProducts(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.productService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a product" })
  @ApiResponse({ status: 200, description: "Product updated successfully" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateProductDto: UpdateProductDto) {
    return await this.productService.update(id, updateProductDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.productService.remove(id);
  }

  // Bulk Operations
  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple products' })
  @ApiResponse({ status: 201, description: 'Products created successfully' })
  async bulkCreate(@Body() bulkCreateDto: BulkCreateProductDto) {
    return await this.productService.bulkCreate(bulkCreateDto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple products' })
  @ApiResponse({ status: 200, description: 'Products updated successfully' })
  async bulkUpdate(@Body() bulkUpdateDto: BulkUpdateProductDto) {
    return await this.productService.bulkUpdate(bulkUpdateDto);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple products' })
  @ApiResponse({ status: 200, description: 'Products deleted successfully' })
  async bulkDelete(@Body() bulkDeleteDto: BulkDeleteProductDto) {
    return await this.productService.bulkDelete(bulkDeleteDto);
  }

  // Image Upload Endpoints
  @Post(":id/images")
  @UseInterceptors(FilesInterceptor("images", 10))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload product images" })
  @ApiResponse({ status: 201, description: "Images uploaded successfully" })
  async uploadImages(@Param('id', ParseUUIDPipe) id: string, @UploadedFiles() files: any[]) {
    return await this.productService.uploadImages(id, files)
  }

  @Delete(":id/images/:imageId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a product image" })
  @ApiResponse({ status: 204, description: "Image deleted successfully" })
  @ApiResponse({ status: 404, description: "Image not found" })
  async deleteImage(@Param('id', ParseUUIDPipe) id: string, @Param('imageId', ParseUUIDPipe) imageId: string) {
    await this.productService.deleteImage(id, imageId)
  }
}
