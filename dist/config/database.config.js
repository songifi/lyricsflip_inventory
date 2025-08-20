"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSourceOptions = exports.databaseConfig = void 0;
const config_1 = require("@nestjs/config");
exports.databaseConfig = (0, config_1.registerAs)('database', () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const isTest = process.env.NODE_ENV === 'test';
    return {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'nestjs_app',
        schema: process.env.DB_SCHEMA || 'public',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
        synchronize: false,
        logging: !isProduction && !isTest ? ['query', 'error'] : ['error'],
        extra: {
            connectionLimit: parseInt(process.env.DB_POOL_MAX ?? '10', 10),
            acquireTimeout: parseInt(process.env.DB_POOL_ACQUIRE_TIMEOUT ?? '60000', 10),
            timeout: parseInt(process.env.DB_POOL_IDLE_TIMEOUT ?? '30000', 10),
            min: parseInt(process.env.DB_POOL_MIN ?? '2', 10),
            max: parseInt(process.env.DB_POOL_MAX ?? '10', 10),
        },
        maxQueryExecutionTime: 5000,
        migrationsRun: process.env.RUN_MIGRATIONS === 'true',
        migrationsTableName: 'migrations_history',
        ssl: isProduction ? { rejectUnauthorized: false } : false,
        retryAttempts: 3,
        retryDelay: 3000,
    };
});
exports.dataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nestjs_app',
    schema: process.env.DB_SCHEMA || 'public',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: false,
    logging: false,
};
//# sourceMappingURL=database.config.js.map