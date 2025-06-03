import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
} from "@nestjs/common";
import { BatchManagementService } from "./batch-management.service";
import { CreateBatchDto } from "./dto/create-batch.dto";
import { UpdateBatchDto } from "./dto/update-batch.dto";

@Controller("batch-management")
export class BatchManagementController {
    constructor(
        private readonly batchManagementService: BatchManagementService
    ) {}

    @Post()
    create(@Body() createBatchDto: CreateBatchDto) {
        return this.batchManagementService.create(createBatchDto);
    }

    @Get()
    findAll() {
        return this.batchManagementService.findAll();
    }

    @Get("expiring")
    findExpiring(@Query("days") days: number = 30) {
        return this.batchManagementService.getExpiringBatches(days);
    }

    @Get("expired")
    findExpired() {
        return this.batchManagementService.getExpiredBatches();
    }

    @Get("product/:productId")
    findByProduct(@Param("productId") productId: string) {
        return this.batchManagementService.getBatchesByProduct(productId);
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        return this.batchManagementService.findOne(id);
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() updateBatchDto: UpdateBatchDto) {
        return this.batchManagementService.update(id, updateBatchDto);
    }

    @Patch(":id/quantity")
    updateQuantity(
        @Param("id") id: string,
        @Body("quantity") quantity: number
    ) {
        return this.batchManagementService.updateRemainingQuantity(
            id,
            quantity
        );
    }

    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.batchManagementService.remove(id);
    }
}
