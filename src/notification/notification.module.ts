import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './services/notification.service';
import { SmsNotificationService } from './services/sms-notification.service';
import { InappNotificationService } from './services/ in-app-notification.service';
import { EmailNotificationService } from './services/email-notification.service';
import { DispatcherService } from './services/dispatcher.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InAppNotification } from './entities/inapp-notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InAppNotification])],
  controllers: [NotificationController],
  providers: [NotificationService, SmsNotificationService,InappNotificationService,EmailNotificationService,DispatcherService],
})
export class NotificationModule {}
