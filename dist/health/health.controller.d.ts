import { HealthCheckService, TypeOrmHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';
import { DatabaseService } from '../database/database.service';
export declare class HealthController {
    private health;
    private db;
    private memory;
    private disk;
    private databaseService;
    constructor(health: HealthCheckService, db: TypeOrmHealthIndicator, memory: MemoryHealthIndicator, disk: DiskHealthIndicator, databaseService: DatabaseService);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
    databaseHealth(): Promise<{
        status: string;
        details: {
            isConnected: boolean;
            database: string;
            schema: string;
            poolSize?: number;
        };
        timestamp: string;
    }>;
}
