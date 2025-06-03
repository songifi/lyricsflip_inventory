import { Module } from '@nestjs/common';
import { PreferenceService } from './preference.service';
import { PreferenceController } from './preference.controller';

@Module({
  controllers: [PreferenceController],
  providers: [PreferenceService],
})
export class PreferenceModule {}
