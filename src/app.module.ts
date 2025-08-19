import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { StockMovementModule } from './stock-movement/stock-movement.module';
import { StockLevelModule } from './stock-level/stock-level.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (config) => config,
    }),
    DatabaseModule,
    HealthModule,
    StockMovementModule,
    StockLevelModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
