"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DatabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
let DatabaseService = DatabaseService_1 = class DatabaseService {
    dataSource;
    logger = new common_1.Logger(DatabaseService_1.name);
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async onModuleInit() {
        try {
            if (this.dataSource.isInitialized) {
                this.logger.log('Database connection established successfully');
                await this.logConnectionInfo();
            }
        }
        catch (error) {
            this.logger.error('Failed to connect to database', error);
            throw error;
        }
    }
    async logConnectionInfo() {
        try {
            const { driver } = this.dataSource;
            this.logger.log(`Connected to ${driver.database} on`);
        }
        catch (error) {
            this.logger.warn('Could not log connection info', error.message);
        }
    }
    async getConnectionStatus() {
        try {
            const isConnected = this.dataSource.isInitialized;
            return {
                isConnected,
                database: this.dataSource.options.database,
                schema: this.dataSource.options.schema || 'public',
                poolSize: this.dataSource.options.poolSize,
            };
        }
        catch (error) {
            this.logger.error('Database health check failed', error);
            return {
                isConnected: false,
                database: 'unknown',
                schema: 'unknown',
            };
        }
    }
    async executeRawQuery(query, parameters) {
        try {
            return await this.dataSource.query(query, parameters);
        }
        catch (error) {
            this.logger.error('Raw query execution failed', error);
            throw error;
        }
    }
    async setSearchPath(schema) {
        try {
            await this.dataSource.query(`SET search_path TO ${schema}`);
            this.logger.debug(`Search path set to: ${schema}`);
        }
        catch (error) {
            this.logger.error(`Failed to set search path to ${schema}`, error);
            throw error;
        }
    }
    async createSchema(schemaName) {
        try {
            await this.dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
            this.logger.log(`Schema created: ${schemaName}`);
        }
        catch (error) {
            this.logger.error(`Failed to create schema: ${schemaName}`, error);
            throw error;
        }
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = DatabaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], DatabaseService);
//# sourceMappingURL=database.service.js.map