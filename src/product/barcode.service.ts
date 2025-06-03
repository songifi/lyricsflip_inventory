import { Injectable } from "@nestjs/common";
import { BarcodeFormat, BarcodeUtils } from "utils/barcode.util";

@Injectable()
export class BarcodeService {
  async generateProductBarcode(): Promise<string> {
    return BarcodeUtils.generateBarcode(BarcodeFormat.EAN13);
  }

  async validateBarcode(barcode: string, format: BarcodeFormat): Promise<boolean> {
    switch (format) {
      case BarcodeFormat.EAN13:
        return Promise.resolve(BarcodeUtils.validateEAN13(barcode));
      default:
        throw new Error('Validation not supported for this format');
    }
  }
  
}
