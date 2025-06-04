// analyticsAPI/analytics.module.ts
import { Module } from "@nestjs/common";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";
import { DashboardService } from "./dashboard.service";
import { KpiService } from "./kpi.service";
import { InventoryService } from "./inventory.service";
import { TrendService } from "./trend.service";

@Module({
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    DashboardService,
    KpiService,
    InventoryService,
    TrendService,
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
