
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Product } from './product/entities/product.entity';
import { ProductModule } from './product/product.module';
import { PharmacyModule } from './pharmacy/pharmacy.module';
import { ProductsModule } from './products/products.module';
import { SupplierModule } from './supplier/supplier.module';
import { HealthModule } from './health/health.module';
import { NotificationModule } from './notification/notification.module';
import { PreferenceModule } from './preference/preference.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => {
				const portStr = config.get<string>('DB_PORT');
				if (!portStr) {
					throw new Error('DB_PORT environment variable is not defined');
				}
				return {
					type: 'postgres',
					host: config.get<string>('DB_HOST'),
					port: parseInt(portStr, 10),
					username: config.get<string>('DB_USERNAME'),
					password: config.get<string>('DB_PASSWORD'),
					database: config.get<string>('DB_NAME'),
					entities: [Product],
					synchronize: true,
				};
			},
		}),
		ProductModule,
		PharmacyModule,
		ProductsModule,
		SupplierModule,
		HealthModule,
		NotificationModule,
		PreferenceModule,
	],

import { Module } from "@nestjs/common";

import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { LoggingMiddleware } from "./middleware/logging.middleware";


import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Product } from "./product/entities/product.entity";
import { ProductModule } from "./product/product.module";
import { PharmacyModule } from "./pharmacy/pharmacy.module";
import { ReportModule } from "./report/report.module";
import { ProductsModule } from "./products/products.module";
import { SupplierModule } from "./supplier/supplier.module";
import { HealthModule } from "./health/health.module";
import { seconds, ThrottlerModule } from "@nestjs/throttler";
import { ThrottlerStorageRedisService } from "@nest-lab/throttler-storage-redis";
import { NotificationModule } from './notification/notification.module';
import { PreferenceModule } from './preference/preference.module';
import { NotificationModule } from "./notification/notification.module";
import { PreferenceModule } from "./preference/preference.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
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
    PreferenceModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes("*");
  }
}
