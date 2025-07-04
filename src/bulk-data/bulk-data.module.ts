import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { BulkDataController } from './bulk-data.controller';
import { BulkDataService } from './bulk-data.service';
import { CsvService } from './csv.service';
import { ValidationService } from './validation.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  ],
  controllers: [BulkDataController],
  providers: [BulkDataService, CsvService, ValidationService],
  exports: [BulkDataService, CsvService],
})
export class BulkDataModule {}