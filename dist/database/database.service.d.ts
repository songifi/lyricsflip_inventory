import { OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
export declare class DatabaseService implements OnModuleInit {
    private readonly dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    onModuleInit(): Promise<void>;
    private logConnectionInfo;
    getConnectionStatus(): Promise<{
        isConnected: boolean;
        database: string;
        schema: string;
        poolSize?: number;
    }>;
    executeRawQuery(query: string, parameters?: any[]): Promise<any>;
    setSearchPath(schema: string): Promise<void>;
    createSchema(schemaName: string): Promise<void>;
}
