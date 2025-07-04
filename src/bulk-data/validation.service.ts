import { Injectable, Logger } from '@nestjs/common';
import { ValidationResult, ValidationError } from './interfaces/bulk-data.interface';
import { BulkUpdateDto } from './dto/bulk-operation.dto';

@Injectable()
export class ValidationService {
  private readonly logger = new Logger(ValidationService.name);

  async validateRow(
    row: any,
    requiredFields: string[] = [],
    entityType: string = 'default',
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Check required fields
    for (const field of requiredFields) {
      if (!row[field] || row[field] === null || row[field] === '') {
        errors.push({
          field,
          message: `${field} is required`,
          value: row[field],
        });
      }
    }

    // Entity-specific validation
    const entityValidationErrors = await this.validateEntitySpecificFields(row, entityType);
    errors.push(...entityValidationErrors);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async validateUpdateItem(item: BulkUpdateDto): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Check if ID is provided
    if (!item.id || item.id.trim() === '') {
      errors.push({
        field: 'id',
        message: 'ID is required for update operations',
        value: item.id,
      });
    }

    // Check if data is provided
    if (!item.data || Object.keys(item.data).length === 0) {
      errors.push({
        field: 'data',
        message: 'Data is required for update operations',
        value: item.data,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private async validateEntitySpecificFields(
    row: any,
    entityType: string,
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Add your entity-specific validation logic here
    switch (entityType) {
      case 'user':
        errors.push(...this.validateUserFields(row));
        break;
      case 'product':
        errors.push(...this.validateProductFields(row));
        break;
      default:
        // Default validation
        break;
    }

    return errors;
  }

  private validateUserFields(row: any): ValidationError[] {
    const errors: ValidationError[] = [];

    // Email validation
    if (row.email && !this.isValidEmail(row.email)) {
      errors.push({
        field: 'email',
        message: 'Invalid email format',
        value: row.email,
      });
    }

    // Add more user-specific validations as needed

    return errors;
  }

  private validateProductFields(row: any): ValidationError[] {
    const errors: ValidationError[] = [];

    // Price validation
    if (row.price && (isNaN(row.price) || row.price < 0)) {
      errors.push({
        field: 'price',
        message: 'Price must be a valid positive number',
        value: row.price,
      });
    }

    // Add more product-specific validations as needed

    return errors;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}