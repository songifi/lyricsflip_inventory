import {
  Controller,
  Post,
  Get,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { BulkDataService } from './bulk-data.service';
import { BulkOperationDto, ImportOptionsDto } from './dto/bulk-operation.dto';

@Controller('bulk-data')
export class BulkDataController {
  constructor(private readonly bulkDataService: BulkDataService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(
    @UploadedFile() file: Express.Multer.File,
    @Body() options: ImportOptionsDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      throw new BadRequestException('Only CSV files are allowed');
    }

    try {
      const result = await this.bulkDataService.importFromCsv(file.buffer, options);
      return {
        statusCode: HttpStatus.OK,
        message: 'Import completed',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(`Import failed: ${error.message}`);
    }
  }

  @Get('export')
  async exportCsv(
    @Query('entityType') entityType: string,
    @Query('filters') filters: string,
    @Res() res: Response,
  ) {
    try {
      const parsedFilters = filters ? JSON.parse(filters) : {};
      const csvData = await this.bulkDataService.exportToCsv(entityType, parsedFilters);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${entityType}-export.csv"`);
      res.send(csvData);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Export failed: ${error.message}`,
      });
    }
  }

  @Post('bulk-update')
  async bulkUpdate(@Body() bulkOperationDto: BulkOperationDto) {
    try {
      const result = await this.bulkDataService.bulkUpdate(bulkOperationDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Bulk update completed',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(`Bulk update failed: ${error.message}`);
    }
  }

  @Get('template/:entityType')
  async downloadTemplate(
    @Res() res: Response,
    @Query('entityType') entityType: string,
  ) {
    try {
      const template = await this.bulkDataService.generateTemplate(entityType);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${entityType}-template.csv"`);
      res.send(template);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Template generation failed: ${error.message}`,
      });
    }
  }
}
