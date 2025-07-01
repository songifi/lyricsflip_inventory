import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EncryptionService } from "./services/encryption.service";
import { SigningService } from "./services/signing.service";
import { AuditService } from "./services/audit.service";
import { SecurityMonitoringService } from "./services/security-monitoring.service";
import { SecurityController } from "./controllers/security.controller";
import { SigningMiddleware } from "./middleware/signing.middleware";
import { AuditMiddleware } from "./middleware/audit.middleware";
import { SecurityMonitoringMiddleware } from "./middleware/security-monitoring.middleware";

@Module({
  imports: [ConfigModule],
  providers: [
    EncryptionService,
    SigningService,
    AuditService,
    SecurityMonitoringService,
  ],
  controllers: [SecurityController],
  exports: [
    EncryptionService,
    SigningService,
    AuditService,
    SecurityMonitoringService,
  ],
})
export class SecurityModule {}
