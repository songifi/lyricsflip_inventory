// analyticsAPI/analytics.service.ts
import { Injectable } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { KpiService } from "./kpi.service";
import { InventoryService } from "./inventory.service";
import { TrendService } from "./trend.service";

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly kpiService: KpiService,
    private readonly inventoryService: InventoryService,
    private readonly trendService: TrendService
  ) {}

  async getComprehensiveAnalytics(period: string = "month") {
    const [dashboard, kpis, inventory, trends] = await Promise.all([
      this.dashboardService.getSummary(period),
      this.kpiService.getKpis(undefined, period),
      this.inventoryService.getRealTimeStatus(),
      this.trendService.getAnalysis("sales", period),
    ]);

    return {
      dashboard,
      kpis,
      inventory,
      trends,
      generatedAt: new Date().toISOString(),
    };
  }
}
