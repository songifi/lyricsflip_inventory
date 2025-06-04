import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Batch } from "../entities/batch.entity";

@Injectable()
export class BatchExpiryNotificationService {
    private readonly logger = new Logger(BatchExpiryNotificationService.name);

    constructor(
        @InjectRepository(Batch)
        private batchRepository: Repository<Batch>
    ) {}

    async sendExpiryNotification(batch: Batch): Promise<void> {
        try {
            // Calculate days until expiry
            const daysUntilExpiry = this.calculateDaysUntilExpiry(
                batch.expiryDate
            );

            // Create notification message
            const message = this.createExpiryNotificationMessage(
                batch,
                daysUntilExpiry
            );

            // TODO: Implement your preferred notification method here
            // This could be email, SMS, push notification, etc.
            this.logger.log(`Sending expiry notification: ${message}`);

            // Mark batch as notified
            await this.batchRepository.update(batch.id, {
                isNotified: true,
            });
        } catch (error) {
            this.logger.error(
                `Failed to send expiry notification for batch ${batch.id}: ${error.message}`
            );
        }
    }

    async sendExpiredNotification(batch: Batch): Promise<void> {
        try {
            const message = this.createExpiredNotificationMessage(batch);

            // TODO: Implement your preferred notification method here
            this.logger.log(`Sending expired notification: ${message}`);
        } catch (error) {
            this.logger.error(
                `Failed to send expired notification for batch ${batch.id}: ${error.message}`
            );
        }
    }

    private calculateDaysUntilExpiry(expiryDate: Date): number {
        const today = new Date();
        const diffTime = expiryDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    private createExpiryNotificationMessage(
        batch: Batch,
        daysUntilExpiry: number
    ): string {
        return (
            `Batch ${batch.batchNumber} of product ${batch.product.name} will expire in ${daysUntilExpiry} days. ` +
            `Current quantity: ${batch.remainingQuantity}`
        );
    }

    private createExpiredNotificationMessage(batch: Batch): string {
        return (
            `ALERT: Batch ${batch.batchNumber} of product ${batch.product.name} has expired. ` +
            `Remaining quantity: ${batch.remainingQuantity}`
        );
    }
}
