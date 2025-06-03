import { Controller, Post, Body, Patch, Param, Query, Get } from '@nestjs/common';
import { SendNotificationDto } from './dto/send-notification.dto';
import { NotificationService } from './services/notification.service';
import { InappNotificationService } from './services/ in-app-notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,

    private readonly service: InappNotificationService
  ) {}

  @Post('send')
  public async sendNotification(@Body() dto: SendNotificationDto) {
    await this.notificationService.sendNotification(dto);
    return { message: 'Notification dispatched successfully' };
  }

   @Get('in-app-notifications/:userId')
  public async getUserNotifications(
    @Param('userId') userId: string,
    @Query('unreadOnly') unreadOnly: string
  ) {
    const onlyUnread = unreadOnly === 'true';
    return this.service.getUserNotifications(userId, onlyUnread);
  }

  @Patch('in-app-notifications/:id/read')
  public async markAsRead(@Param('id') id: string) {
    await this.service.markAsRead(id);
    return { message: 'Marked as read' };
  }

  @Patch('in-app-notifications/mark-all/:userId')
  public async markAllAsRead(@Param('userId') userId: string) {
    await this.service.markAllAsRead(userId);
    return { message: 'All marked as read' };
  }
}
