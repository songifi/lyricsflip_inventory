import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from './entities/setting.entity';
import { SettingHistory } from './entities/setting-history.entity';
import { SettingsService } from './services/settings.service';
import { SettingsController } from './controllers/settings.controller';
import { CompanySettingsController } from './controllers/company-settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Setting, SettingHistory])],
  controllers: [SettingsController, CompanySettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}