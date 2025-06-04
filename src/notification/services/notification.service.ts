import { Injectable } from '@nestjs/common';
import { DispatcherService } from './dispatcher.service';
import { SendNotificationDto } from '../dto/send-notification.dto';


@Injectable()
export class NotificationService {
  constructor(private readonly dispatcher: DispatcherService) {}

  async sendNotification(dto: SendNotificationDto) {
    await this.dispatcher.dispatch(dto);
  }
}
