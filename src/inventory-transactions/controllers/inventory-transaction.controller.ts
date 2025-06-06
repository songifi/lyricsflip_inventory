import { Controller, Get, Post, Body, Patch, Param, Query, HttpCode, HttpStatus } from "@nestjs/common"
import type { InventoryTransactionService } from "../services/inventory-transaction.service"
import type { CreateTransactionDto } from "../dto/create-transaction.dto"
import type { UpdateTransactionStatusDto } from "../dto/update-transaction-status.dto"
import type { ProcessTransactionDto } from "../dto/process-transaction.dto"
import type { TransactionQueryDto } from "../dto/transaction-query.dto"

@Controller("inventory-transactions")
export class InventoryTransactionController {
  constructor(private readonly transactionService: InventoryTransactionService) {}

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.create(createTransactionDto);
  }

  @Get()
  findAll(@Query() queryDto: TransactionQueryDto) {
    return this.transactionService.findAll(queryDto);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.transactionService.findOne(id)
  }

  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() updateStatusDto: UpdateTransactionStatusDto) {
    return this.transactionService.updateStatus(id, updateStatusDto)
  }

  @Post(":id/process")
  processTransaction(@Param("id") id: string, @Body() processDto: ProcessTransactionDto) {
    return this.transactionService.processTransaction(id, processDto)
  }

  @Post(":id/reverse")
  @HttpCode(HttpStatus.OK)
  reverseTransaction(@Param("id") id: string, @Body() body: { reason: string; performedBy: string }) {
    return this.transactionService.reverseTransaction(id, body.reason, body.performedBy)
  }

  @Get("product/:productId")
  getTransactionsByProduct(@Param("productId") productId: string) {
    return this.transactionService.getTransactionsByProduct(productId)
  }

  @Get("warehouse/:warehouseId")
  getTransactionsByWarehouse(@Param("warehouseId") warehouseId: string) {
    return this.transactionService.getTransactionsByWarehouse(warehouseId)
  }

  @Get(":id/audit-trail")
  getAuditTrail(@Param("id") id: string) {
    return this.transactionService.getAuditTrail(id)
  }
}
