import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
export declare const databaseConfig: (() => TypeOrmModuleOptions) & import("@nestjs/config").ConfigFactoryKeyHost<TypeOrmModuleOptions>;
export declare const dataSourceOptions: DataSourceOptions;
