import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { EncryptionService } from "../services/encryption.service";

@Injectable()
export class EncryptionInterceptor implements NestInterceptor {
  constructor(private encryptionService: EncryptionService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Encrypt sensitive fields in response
        if (data && typeof data === "object") {
          return this.encryptSensitiveFields(data);
        }
        return data;
      })
    );
  }

  private encryptSensitiveFields(data: any): any {
    const sensitiveFields = ["password", "token", "secret", "key"];

    if (Array.isArray(data)) {
      return data.map((item) => this.encryptSensitiveFields(item));
    }

    if (data && typeof data === "object") {
      const result = { ...data };

      Object.keys(result).forEach((key) => {
        if (sensitiveFields.includes(key.toLowerCase())) {
          result[key] = this.encryptionService.encryptField(result[key]);
        } else if (typeof result[key] === "object") {
          result[key] = this.encryptSensitiveFields(result[key]);
        }
      });

      return result;
    }

    return data;
  }
}
