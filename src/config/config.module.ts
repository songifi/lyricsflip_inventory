import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './config.service';
import environmentConfig, { validate } from './environment.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [environmentConfig],
      validate,
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}

