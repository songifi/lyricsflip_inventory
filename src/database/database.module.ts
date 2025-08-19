import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { databaseConfig } from '../config/database.config';
import { DatabaseService } from './database.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        
        return {
          ...dbConfig,
          // Custom connection name for multi-tenancy if needed
          name: 'default',
          
          // Error handling
          retryAttempts: 3,
          retryDelay: 3000,
          autoLoadEntities: true,
          
          // Connection event handlers
          subscribers: [],
          
          // Advanced pooling configuration
          poolSize: parseInt(process.env.DB_POOL_MAX, 10) || 10,
          
          // Query timeout
          acquireTimeout: 60000,
          
          // Keep connection alive
          keepConnectionAlive: true,
        };
      },
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService, TypeOrmModule],
})
export class DatabaseModule {}