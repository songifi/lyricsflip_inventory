// barcode.utils.ts
import { customAlphabet } from 'nanoid';

export enum BarcodeFormat {
  EAN13 = 'EAN13',
  CODE128 = 'CODE128',
}

export class BarcodeUtils {
  static generateBarcode(format: BarcodeFormat = BarcodeFormat.CODE128): string {
    switch (format) {
      case BarcodeFormat.EAN13:
        return BarcodeUtils.generateEAN13();
      case BarcodeFormat.CODE128:
        return BarcodeUtils.generateCode128();
      default:
        throw new Error('Unsupported barcode format');
    }
  }

  private static generateEAN13(): string {
    const digits = customAlphabet('0123456789', 12)();
    const checksum = BarcodeUtils.calculateEAN13Checksum(digits);
    return `${digits}${checksum}`;
  }

  private static generateCode128(): string {
    return customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12)();
  }

  private static calculateEAN13Checksum(digits: string): number {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const num = parseInt(digits.charAt(i), 10);
      sum += i % 2 === 0 ? num : num * 3;
    }
    const remainder = sum % 10;
    return remainder === 0 ? 0 : 10 - remainder;
  }

  static validateEAN13(barcode: string): boolean {
    if (!/^\d{13}$/.test(barcode)) return false;
    const digits = barcode.slice(0, 12);
    const checksum = parseInt(barcode[12], 10);
    return BarcodeUtils.calculateEAN13Checksum(digits) === checksum;
  }
}
