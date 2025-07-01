import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import * as bcrypt from "bcrypt";

@Injectable()
export class EncryptionService {
  private readonly algorithm = "aes-256-gcm";
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;
  private readonly saltRounds = 12;

  constructor(private configService: ConfigService) {}

  private getEncryptionKey(): Buffer {
    const key = this.configService.get<string>("ENCRYPTION_KEY");
    if (!key) {
      throw new Error("ENCRYPTION_KEY not configured");
    }
    return crypto.scryptSync(key, "salt", this.keyLength);
  }

  // Data encryption at rest
  encryptData(data: string): string {
    try {
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipher(this.algorithm, key);
      cipher.setAAD(Buffer.from("additional-data"));

      let encrypted = cipher.update(data, "utf8", "hex");
      encrypted += cipher.final("hex");

      const tag = cipher.getAuthTag();

      return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  decryptData(encryptedData: string): string {
    try {
      const [ivHex, tagHex, encrypted] = encryptedData.split(":");
      const key = this.getEncryptionKey();
      const iv = Buffer.from(ivHex, "hex");
      const tag = Buffer.from(tagHex, "hex");

      const decipher = crypto.createDecipher(this.algorithm, key);
      decipher.setAAD(Buffer.from("additional-data"));
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  // Hash sensitive data
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate secure random tokens
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString("hex");
  }

  // Encrypt database fields
  encryptField(value: any): string {
    if (value === null || value === undefined) return value;
    return this.encryptData(JSON.stringify(value));
  }

  decryptField(encryptedValue: string): any {
    if (!encryptedValue) return encryptedValue;
    try {
      const decryptedValue = this.decryptData(encryptedValue);
      return JSON.parse(decryptedValue);
    } catch {
      return encryptedValue; // Return as-is if not encrypted
    }
  }
}
