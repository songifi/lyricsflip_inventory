import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HospitalConfigService } from './hospital-config.service';
import { HospitalConfigController } from './hospital-config.controller';
import { HospitalConfig } from './entities/hospital-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HospitalConfig])],
  controllers: [HospitalConfigController],
  providers: [HospitalConfigService],
  exports: [HospitalConfigService],
})
export class HospitalConfigModule {}
