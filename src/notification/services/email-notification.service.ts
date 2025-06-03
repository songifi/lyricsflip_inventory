import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { NotificationChannel } from '../interfaces/notification-channel.interface';

@Injectable()
export class EmailNotificationService implements NotificationChannel {
  async send(userId: string, type: string, context: Record<string, any>): Promise<void> {
    const templatePath = path.join(__dirname, 'templates/email-templates', `${type}.hbs`);
    const template = fs.readFileSync(templatePath, 'utf-8');
    const compiled = Handlebars.compile(template)(context);
    // TODO: send via nodemailer or SendGrid
    console.log(`Sending email to ${userId}:\n${compiled}`);
  }
}
