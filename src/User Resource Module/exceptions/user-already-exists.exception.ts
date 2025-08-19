import { ConflictException } from "@nestjs/common";

export class UserAlreadyExistsException extends ConflictException {
  constructor(field: string, value: string) {
    super(`User with ${field} '${value}' already exists`);
  }
}
