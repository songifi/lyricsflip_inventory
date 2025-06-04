// Temporary module declaration for nodemailer types
// Remove if you install @types/nodemailer
declare module 'nodemailer';

import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure transporter for Gmail. For production, use OAuth2 or App Passwords.
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.ALERT_EMAIL_USER, // set in your .env
        pass: process.env.ALERT_EMAIL_PASS, // set in your .env
      },
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.ALERT_EMAIL_USER,
        to,
        subject,
        text,
        html,
      });
      this.logger.log(`Alert email sent to ${to}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to send alert email: ${err.message}`);
    }
  }
}
