import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class SearchValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'body' && value.query !== undefined) {
      // Validate query length
      if (typeof value.query === 'string' && value.query.length > 1000) {
        throw new BadRequestException('Query too long (max 1000 characters)');
      }

      // Sanitize query
      if (typeof value.query === 'string') {
        value.query = value.query.trim();
        
        // Remove potentially dangerous characters
        value.query = value.query.replace(/[<>{}[\]]/g, '');
      }

      // Validate page and limit
      if (value.page && (value.page < 1 || value.page > 1000)) {
        throw new BadRequestException('Page must be between 1 and 1000');
      }

      if (value.limit && (value.limit < 1 || value.limit > 100)) {
        throw new BadRequestException('Limit must be between 1 and 100');
      }
    }

    return value;
  }
}