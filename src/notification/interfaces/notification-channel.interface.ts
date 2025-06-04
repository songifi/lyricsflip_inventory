export interface NotificationChannel {
  send(userId: string, type: string, context: Record<string, any>): Promise<void>;
}
