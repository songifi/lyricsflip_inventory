import { BadRequestException } from "@nestjs/common";

export class InsufficientStockException extends BadRequestException {
  constructor(itemId: string, available: number, requested: number) {
    super(
      `Insufficient stock for item ${itemId}. Available: ${available}, Requested: ${requested}`
    );
  }
}