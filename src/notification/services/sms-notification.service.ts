import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { NotificationChannel } from '../interfaces/notification-channel.interface';

@Injectable()
export class SmsNotificationService implements NotificationChannel {
  private twilioClient: Twilio;

  constructor(private readonly config: ConfigService) {
    this.twilioClient = new Twilio(
      this.config.get('TWILIO_ACCOUNT_SID'),
      this.config.get('TWILIO_AUTH_TOKEN'),
    );
  }

  async send(userId: string, type: string, context: Record<string, any>): Promise<void> {
    // Normally you'd look up the phone number from the user profile
    const userPhoneNumber = await this.lookupPhoneNumber(userId);
    if (!userPhoneNumber) {
      console.warn(`[SMS] No phone number found for user ${userId}`);
      return;
    }

    const message = this.generateMessage(type, context);

    await this.twilioClient.messages.create({
      body: message,
      from: this.config.get('TWILIO_PHONE_NUMBER'),
      to: userPhoneNumber,
    });

    console.log(`[SMS] Sent "${type}" SMS to ${userPhoneNumber}`);
  }

  private async lookupPhoneNumber(userId: string): Promise<string | null> {
    // TODO: Replace this with actual DB lookup from UserService
    const mockUserDirectory: Record<string, string> = {
      '123': '+11234567890',
    };
    return mockUserDirectory[userId] || null;
  }

  private generateMessage(type: string, context: Record<string, any>): string {
    switch (type) {
      case 'password_reset':
        return `Reset your password: ${context.resetUrl}`;
      case 'event_reminder':
        return `Reminder: ${context.eventName} at ${context.time}`;
      default:
        return 'You have a new notification.';
    }
  }
}
