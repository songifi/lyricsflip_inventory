import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Product } from "./product/entities/product.entity";
import { ProductModule } from "./product/product.module";
import { PharmacyModule } from "./pharmacy/pharmacy.module";
import { ReportModule } from "./report/report.module";
import { ProductsModule } from "./products/products.module";
import { SupplierModule } from "./supplier/supplier.module";
import { HealthModule } from "./health/health.module";
import { NotificationModule } from "./notification/notification.module";
import { PreferenceModule } from "./preference/preference.module";
import { SystemConfigModule } from "./system-config/system-config.module";
import { LoggingMiddleware } from "./middleware/logging.middleware";
import configuration from "./config/configuration";
import { AppConfigModule } from './config/config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BarcodeModule } from './barcode/barcode.module';
import { IntegrationModule } from './integration/integration.module';
import { ProductManagementModule } from "./product management/product-management.module";


@Module({
  imports: [
    AppConfigModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const portStr = config.get<string>("DB_PORT");
        if (!portStr) {
          throw new Error("DB_PORT environment variable is not defined");
        }
        return {
          type: "postgres",
          host: config.get<string>("DB_HOST"),
          port: parseInt(portStr, 10),
          username: config.get<string>("DB_USERNAME"),
          password: config.get<string>("DB_PASSWORD"),
          database: config.get<string>("DB_NAME"),
          entities: [Product],
          synchronize: true,
        };
      },
    }),
    ProductModule,
    PharmacyModule,
    ReportModule,
    ProductsModule,
    SupplierModule,
    HealthModule,
    NotificationModule,
    PreferenceModule,
    SystemConfigModule,
    BarcodeModule,
    IntegrationModule,
    ProductManagementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes("*");
  }
}
