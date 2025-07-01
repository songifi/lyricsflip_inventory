import { Transform } from "class-transformer";
import { EncryptionService } from "../services/encryption.service";

export function EncryptedField() {
  return Transform(({ value, type }) => {
    const encryptionService = new EncryptionService(null); // In real app, inject properly

    if (type === 0) {
      // toClassObject
      return encryptionService.decryptField(value);
    } else {
      // toPlainObject
      return encryptionService.encryptField(value);
    }
  });
}
