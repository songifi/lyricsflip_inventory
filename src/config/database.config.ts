import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

export const databaseConfig = registerAs(
  'database',
  (): TypeOrmModuleOptions => {
    const isProduction = process.env.NODE_ENV === 'production';
    const isTest = process.env.NODE_ENV === 'test';

    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'nestjs_app',
      schema: process.env.DB_SCHEMA || 'public',

      // Entity and migration paths
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],

      // Development settings
      synchronize: false, // Always use migrations in production
      logging: !isProduction && !isTest ? ['query', 'error'] : ['error'],

      // Connection pooling
      extra: {
        connectionLimit: parseInt(process.env.DB_POOL_MAX ?? '10', 10),
        acquireTimeout: parseInt(
          process.env.DB_POOL_ACQUIRE_TIMEOUT ?? '60000',
          10,
        ),
        timeout: parseInt(process.env.DB_POOL_IDLE_TIMEOUT ?? '30000', 10),
        min: parseInt(process.env.DB_POOL_MIN ?? '2', 10),
        max: parseInt(process.env.DB_POOL_MAX ?? '10', 10),
      },

      // Multi-tenant configuration
      maxQueryExecutionTime: 5000,

      // Migration settings
      migrationsRun: process.env.RUN_MIGRATIONS === 'true',
      migrationsTableName: 'migrations_history',

      // SSL for production
      ssl: isProduction ? { rejectUnauthorized: false } : false,

      // Connection retry
      retryAttempts: 3,
      retryDelay: 3000,
    };
  },
);

// Separate DataSource for CLI operations
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nestjs_app',
  schema: process.env.DB_SCHEMA || 'public',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false,
  logging: false,
};
