import { Injectable } from '@nestjs/common';
import { EmailNotificationService } from './email-notification.service';
import { PreferencesService } from 'src/preference/services/preference.service';
import { InappNotificationService } from './ in-app-notification.service';
import { SmsNotificationService } from './sms-notification.service';
import { SendNotificationDto } from '../dto/send-notification.dto';

@Injectable()
export class DispatcherService {
  constructor(
    private readonly emailService: EmailNotificationService,
    private readonly smsService: SmsNotificationService,
    private readonly inAppService: InappNotificationService,
    private readonly preferenceService: PreferencesService
  ) {}

  async dispatch(dto: SendNotificationDto) {
    const prefs = await this.preferenceService.getUserPreferences(dto.userId);

    if (prefs[dto.type]?.email) {
      await this.emailService.send(dto.userId, dto.type, dto.context);
    }
    if (prefs[dto.type]?.sms) {
      await this.smsService.send(dto.userId, dto.type, dto.context);
    }
    if (prefs[dto.type]?.inApp) {
      await this.inAppService.send(dto.userId, dto.type, dto.context);
    }
  }
}
