import { BadRequestException } from "@nestjs/common";

export class InvalidMovementException extends BadRequestException {
  constructor(message: string) {
    super(`Invalid stock movement: ${message}`);
  }
}