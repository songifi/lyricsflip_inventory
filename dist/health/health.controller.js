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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const terminus_1 = require("@nestjs/terminus");
const database_service_1 = require("../database/database.service");
let HealthController = class HealthController {
    health;
    db;
    memory;
    disk;
    databaseService;
    constructor(health, db, memory, disk, databaseService) {
        this.health = health;
        this.db = db;
        this.memory = memory;
        this.disk = disk;
        this.databaseService = databaseService;
    }
    check() {
        return this.health.check([
            () => this.db.pingCheck('database'),
            () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
            () => this.disk.checkStorage('storage', {
                path: '/',
                thresholdPercent: 0.9,
            }),
        ]);
    }
    async databaseHealth() {
        const status = await this.databaseService.getConnectionStatus();
        return {
            status: status.isConnected ? 'healthy' : 'unhealthy',
            details: status,
            timestamp: new Date().toISOString(),
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, terminus_1.HealthCheck)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "check", null);
__decorate([
    (0, common_1.Get)('database'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "databaseHealth", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [terminus_1.HealthCheckService,
        terminus_1.TypeOrmHealthIndicator,
        terminus_1.MemoryHealthIndicator,
        terminus_1.DiskHealthIndicator,
        database_service_1.DatabaseService])
], HealthController);
//# sourceMappingURL=health.controller.js.map