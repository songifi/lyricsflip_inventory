import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan } from "typeorm";
import { Batch } from "../entities/batch.entity";
import { BatchExpiryNotificationService } from "./batch-expiry-notification.service";

@Injectable()
export class BatchExpiryMonitoringService {
    private readonly logger = new Logger(BatchExpiryMonitoringService.name);

    constructor(
        @InjectRepository(Batch)
        private batchRepository: Repository<Batch>,
        private batchExpiryNotificationService: BatchExpiryNotificationService
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async checkExpiringBatches() {
        this.logger.log("Checking for expiring batches...");

        // Check batches expiring in the next 30 days
        const expiringBatches = await this.getExpiringBatches(30);

        for (const batch of expiringBatches) {
            await this.batchExpiryNotificationService.sendExpiryNotification(
                batch
            );
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async checkExpiredBatches() {
        this.logger.log("Checking for expired batches...");

        const expiredBatches = await this.getExpiredBatches();

        for (const batch of expiredBatches) {
            await this.markBatchAsExpired(batch.id);
            await this.batchExpiryNotificationService.sendExpiredNotification(
                batch
            );
        }
    }

    private async getExpiringBatches(daysThreshold: number): Promise<Batch[]> {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + daysThreshold);

        return await this.batchRepository.find({
            where: {
                expiryDate: LessThan(expiryDate),
                isExpired: false,
                isNotified: false,
            },
            relations: ["product"],
        });
    }

    private async getExpiredBatches(): Promise<Batch[]> {
        const today = new Date();
        return await this.batchRepository.find({
            where: {
                expiryDate: LessThan(today),
                isExpired: false,
            },
            relations: ["product"],
        });
    }

    private async markBatchAsExpired(id: string): Promise<void> {
        await this.batchRepository.update(id, {
            isExpired: true,
        });
    }
}
