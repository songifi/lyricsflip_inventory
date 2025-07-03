import { Injectable } from '@nestjs/common';
import * as bwipjs from 'bwip-js';

@Injectable()
export class BarcodeService {
  private supportedFormats = ['code128', 'ean13', 'qrcode'];

  getSupportedFormats() {
    return this.supportedFormats;
  }

  async generateBarcode(data: string, format: string) {
    if (!this.supportedFormats.includes(format)) {
      throw new Error('Unsupported barcode format');
    }
    // Generate barcode image as base64
    const png = await bwipjs.toBuffer({
      bcid: format,
      text: data,
      scale: 3,
      height: 10,
      includetext: true,
    });
    return { format, data, image: png.toString('base64') };
  }

  validateBarcode(barcode: string, format: string) {
    // Simple validation logic for demonstration
    if (!this.supportedFormats.includes(format)) {
      return { valid: false, reason: 'Unsupported format' };
    }
    if (!barcode || typeof barcode !== 'string') {
      return { valid: false, reason: 'Invalid barcode' };
    }
    // Add more format-specific validation as needed
    return { valid: true };
  }
}
