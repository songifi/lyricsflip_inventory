import { Module } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { PharmacyController } from './pharmacy.controller';

@Module({
  controllers: [PharmacyController],
  providers: [PharmacyService],
})
export class PharmacyModule {}
