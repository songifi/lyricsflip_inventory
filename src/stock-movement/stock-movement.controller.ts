import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseUUIDPipe,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from "@nestjs/swagger";
import { StockMovementService } from "./stock-movement.service";
import { CreateStockMovementDto } from "./dto/create-stock-movement.dto";
import { UpdateStockMovementDto } from "./dto/update-stock-movement.dto";
import { StockMovementQueryDto } from "./dto/stock-movement-query.dto";
import { StockMovementResponseDto } from "./dto/stock-movement-response.dto";
import { BatchStockMovementDto } from "./dto/batch-movement.dto";
import { plainToClass } from "class-transformer";

@ApiTags("Stock Movements")
@Controller("stock-movements")
@UseInterceptors(ClassSerializerInterceptor)
export class StockMovementController {
  constructor(private readonly stockMovementService: StockMovementService) {}

  @Post()
  @ApiOperation({ summary: "Create a new stock movement" })
  @ApiResponse({
    status: 201,
    description: "Stock movement created successfully",
    type: StockMovementResponseDto,
  })
  @ApiBadRequestResponse({ description: "Invalid input data" })
  @ApiConflictResponse({ description: "Insufficient stock or invalid movement" })
  async create(
    @Body(ValidationPipe) createStockMovementDto: CreateStockMovementDto
  ): Promise<StockMovementResponseDto> {
    const movement = await this.stockMovementService.create(createStockMovementDto);
    return plainToClass(StockMovementResponseDto, movement, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({ summary: "Get all stock movements with filtering and pagination" })
  @ApiResponse({
    status: 200,
    description: "Stock movements retrieved successfully",
    schema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { $ref: "#/components/schemas/StockMovementResponseDto" },
        },
        total: { type: "number" },
        page: { type: "number" },
        limit: { type: "number" },
        totalPages: { type: "number" },
      },
    },
  })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiQuery({ name: "itemId", required: false, type: String })
  @ApiQuery({ name: "warehouseId", required: false, type: String })
  @ApiQuery({
    name: "movementType",
    required: false,
    enum: ["in", "out", "transfer", "adjustment"],
  })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["pending", "completed", "cancelled"],
  })
  @ApiQuery({ name: "performedBy", required: false, type: String })
  @ApiQuery({ name: "referenceNumber", required: false, type: String })
  @ApiQuery({ name: "batchNumber", required: false, type: String })
  @ApiQuery({ name: "dateFrom", required: false, type: String, example: "2024-01-01" })
  @ApiQuery({ name: "dateTo", required: false, type: String, example: "2024-12-31" })
  @ApiQuery({ name: "sortBy", required: false, type: String, example: "createdAt" })
  @ApiQuery({ name: "sortOrder", required: false, enum: ["asc", "desc"] })
  async findAll(@Query(ValidationPipe) query: StockMovementQueryDto) {
    const result = await this.stockMovementService.findAll(query);
    return {
      ...result,
      data: result.data.map((movement) =>
        plainToClass(StockMovementResponseDto, movement, { 
          excludeExtraneousValues: true 
        })
      ),
    };
  }

  @Get("reports")
  @ApiOperation({ summary: "Get stock movement summary report" })
  @ApiResponse({
    status: 200,
    description: "Movement summary retrieved successfully",
    schema: {
      type: "object",
      properties: {
        totalIn: { type: "number" },
        totalOut: { type: "number" },
        totalTransfers: { type: "number" },
        totalAdjustments: { type: "number" },
        netMovement: { type: "number" },
      },
    },
  })
  @ApiQuery({ name: "itemId", required: false, type: String })
  @ApiQuery({ name: "warehouseId", required: false, type: String })
  @ApiQuery({ name: "dateFrom", required: false, type: String })
  @ApiQuery({ name: "dateTo", required: false, type: String })
  async getReport(
    @Query("itemId") itemId?: string,
    @Query("warehouseId") warehouseId?: string,
    @Query("dateFrom") dateFrom?: string,
    @Query("dateTo") dateTo?: string
  ) {
    return this.stockMovementService.getMovementSummary(
      itemId,
      warehouseId,
      dateFrom,
      dateTo
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get stock movement by ID" })
  @ApiParam({ name: "id", description: "Stock Movement UUID" })
  @ApiResponse({
    status: 200,
    description: "Stock movement found",
    type: StockMovementResponseDto,
  })
  @ApiNotFoundResponse({ description: "Stock movement not found" })
  async findOne(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<StockMovementResponseDto> {
    const movement = await this.stockMovementService.findOne(id);
    return plainToClass(StockMovementResponseDto, movement, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update stock movement by ID" })
  @ApiParam({ name: "id", description: "Stock Movement UUID" })
  @ApiResponse({
    status: 200,
    description: "Stock movement updated successfully",
    type: StockMovementResponseDto,
  })
  @ApiBadRequestResponse({ description: "Invalid input data or movement completed" })
  @ApiNotFoundResponse({ description: "Stock movement not found" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateStockMovementDto: UpdateStockMovementDto
  ): Promise<StockMovementResponseDto> {
    const movement = await this.stockMovementService.update(id, updateStockMovementDto);
    return plainToClass(StockMovementResponseDto, movement, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete stock movement by ID" })
  @ApiParam({ name: "id", description: "Stock Movement UUID" })
  @ApiResponse({ status: 204, description: "Stock movement deleted successfully" })
  @ApiNotFoundResponse({ description: "Stock movement not found" })
  @ApiBadRequestResponse({ description: "Cannot delete completed movement" })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.stockMovementService.remove(id);
  }

  @Patch(":id/approve")
  @ApiOperation({ summary: "Approve pending stock movement" })
  @ApiParam({ name: "id", description: "Stock Movement UUID" })
  @ApiResponse({
    status: 200,
    description: "Stock movement approved successfully",
    type: StockMovementResponseDto,
  })
  @ApiNotFoundResponse({ description: "Stock movement not found" })
  @ApiBadRequestResponse({ description: "Movement not in pending status" })
  async approve(
    @Param("id", ParseUUIDPipe) id: string,
    @Body("approvedBy", ParseUUIDPipe) approvedBy: string
  ): Promise<StockMovementResponseDto> {
    const movement = await this.stockMovementService.approve(id, approvedBy);
    return plainToClass(StockMovementResponseDto, movement, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(":id/cancel")
  @ApiOperation({ summary: "Cancel stock movement" })
  @ApiParam({ name: "id", description: "Stock Movement UUID" })
  @ApiResponse({
    status: 200,
    description: "Stock movement cancelled successfully",
    type: StockMovementResponseDto,
  })
  @ApiNotFoundResponse({ description: "Stock movement not found" })
  @ApiBadRequestResponse({ description: "Cannot cancel completed movement" })
  async cancel(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<StockMovementResponseDto> {
    const movement = await this.stockMovementService.cancel(id);
    return plainToClass(StockMovementResponseDto, movement, {
      excludeExtraneousValues: true,
    });
  }

  @Post("batch")
  @ApiOperation({ summary: "Create multiple stock movements in a batch" })
  @ApiResponse({
    status: 201,
    description: "Batch stock movements created successfully",
    type: [StockMovementResponseDto],
  })
  @ApiBadRequestResponse({ description: "Invalid batch data" })
  @ApiConflictResponse({ description: "Insufficient stock for one or more movements" })
  async createBatch(
    @Body(ValidationPipe) batchStockMovementDto: BatchStockMovementDto
  ): Promise<StockMovementResponseDto[]> {
    const movements = await this.stockMovementService.createBatch(batchStockMovementDto);
    return movements.map((movement) =>
      plainToClass(StockMovementResponseDto, movement, {
        excludeExtraneousValues: true,
      })
    );
  }
}

@ApiTags("Items")
@Controller("items")
@UseInterceptors(ClassSerializerInterceptor)
export class ItemStockMovementController {
  constructor(private readonly stockMovementService: StockMovementService) {}

  @Get(":id/movements")
  @ApiOperation({ summary: "Get stock movements for a specific item" })
  @ApiParam({ name: "id", description: "Item UUID" })
  @ApiResponse({
    status: 200,
    description: "Item stock movements retrieved successfully",
    schema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { $ref: "#/components/schemas/StockMovementResponseDto" },
        },
        total: { type: "number" },
        page: { type: "number" },
        limit: { type: "number" },
        totalPages: { type: "number" },
      },
    },
  })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiQuery({
    name: "movementType",
    required: false,
    enum: ["in", "out", "transfer", "adjustment"],
  })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["pending", "completed", "cancelled"],
  })
  @ApiQuery({ name: "dateFrom", required: false, type: String, example: "2024-01-01" })
  @ApiQuery({ name: "dateTo", required: false, type: String, example: "2024-12-31" })
  async findItemMovements(
    @Param("id", ParseUUIDPipe) itemId: string,
    @Query(ValidationPipe) query: StockMovementQueryDto
  ) {
    const result = await this.stockMovementService.findByItemId(itemId, query);
    return {
      ...result,
      data: result.data.map((movement) =>
        plainToClass(StockMovementResponseDto, movement, {
          excludeExtraneousValues: true,
        })
      ),
    };
  }
}