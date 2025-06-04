import { HttpException, HttpStatus } from '@nestjs/common';

export class SearchException extends HttpException {
  constructor(message: string, statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(message, statusCode);
  }
}

export class IndexNotFoundException extends SearchException {
  constructor(indexName: string) {
    super(`Index "${indexName}" not found`, HttpStatus.NOT_FOUND);
  }
}

export class InvalidQueryException extends SearchException {
  constructor(details: string) {
    super(`Invalid search query: ${details}`, HttpStatus.BAD_REQUEST);
  }
}