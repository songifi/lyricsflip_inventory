import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationChannel } from '../interfaces/notification-channel.interface';
import { InAppNotification } from '../entities/inapp-notification.entity';

@Injectable()
export class InappNotificationService implements NotificationChannel {
  constructor(
    @InjectRepository(InAppNotification)
    private readonly repo: Repository<InAppNotification>
  ) {}

  async send(userId: string, type: string, context: Record<string, any>): Promise<void> {
    const notification = this.repo.create({
      userId,
      type,
      payload: context,
    });

    await this.repo.save(notification);

    // TODO: WebSocket broadcast (optional)
    console.log(`[InApp] Notification sent to ${userId}: ${type}`);
  }

  async getUserNotifications(userId: string, unreadOnly = false): Promise<InAppNotification[]> {
    return this.repo.find({
      where: { userId, ...(unreadOnly ? { isRead: false } : {}) },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string): Promise<void> {
    await this.repo.update({ id }, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repo.update({ userId, isRead: false }, { isRead: true });
  }
}
