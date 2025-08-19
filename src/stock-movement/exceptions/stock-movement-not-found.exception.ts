import { NotFoundException } from "@nestjs/common";

export class StockMovementNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Stock movement with ID "${id}" not found`);
  }
}