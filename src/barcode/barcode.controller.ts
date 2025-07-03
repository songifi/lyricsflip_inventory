import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { BarcodeService } from './barcode.service';

@Controller('barcode')
export class BarcodeController {
  constructor(private readonly barcodeService: BarcodeService) {}

  @Post('generate')
  generateBarcode(@Body() body: { data: string; format: string }) {
    return this.barcodeService.generateBarcode(body.data, body.format);
  }

  @Post('validate')
  validateBarcode(@Body() body: { barcode: string; format: string }) {
    return this.barcodeService.validateBarcode(body.barcode, body.format);
  }

  @Get('formats')
  getSupportedFormats() {
    return this.barcodeService.getSupportedFormats();
  }
}
