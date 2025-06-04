// analyticsAPI/analytics.controller.ts
import { Controller, Get, Query, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { DashboardService } from "./dashboard.service";
import { KpiService } from "./kpi.service";
import { InventoryService } from "./inventory.service";
import { TrendService } from "./trend.service";
import {
  DashboardSummaryDto,
  KpiResponseDto,
  InventoryStatusDto,
  TrendAnalysisDto,
} from "./dto/analytics.dto";

@ApiTags("Analytics")
@Controller("analytics")
export class AnalyticsController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly kpiService: KpiService,
    private readonly inventoryService: InventoryService,
    private readonly trendService: TrendService
  ) {}

  @Get("dashboard/summary")
  @ApiOperation({ summary: "Get dashboard summary data" })
  @ApiResponse({
    status: 200,
    description: "Dashboard summary retrieved successfully",
    type: DashboardSummaryDto,
  })
  @ApiQuery({
    name: "period",
    required: false,
    enum: ["day", "week", "month", "year"],
  })
  async getDashboardSummary(
    @Query("period") period: string = "month"
  ): Promise<DashboardSummaryDto> {
    return this.dashboardService.getSummary(period);
  }

  @Get("dashboard/overview")
  @ApiOperation({ summary: "Get dashboard overview with key metrics" })
  @ApiResponse({
    status: 200,
    description: "Dashboard overview retrieved successfully",
  })
  async getDashboardOverview() {
    return this.dashboardService.getOverview();
  }

  @Get("kpi")
  @ApiOperation({ summary: "Get key performance indicators" })
  @ApiResponse({
    status: 200,
    description: "KPIs retrieved successfully",
    type: [KpiResponseDto],
  })
  @ApiQuery({
    name: "category",
    required: false,
    enum: ["sales", "inventory", "customer", "financial"],
  })
  @ApiQuery({
    name: "period",
    required: false,
    enum: ["day", "week", "month", "quarter", "year"],
  })
  async getKpis(
    @Query("category") category?: string,
    @Query("period") period: string = "month"
  ): Promise<KpiResponseDto[]> {
    return this.kpiService.getKpis(category, period);
  }

  @Get("kpi/:metric")
  @ApiOperation({ summary: "Get specific KPI metric" })
  @ApiResponse({
    status: 200,
    description: "KPI metric retrieved successfully",
    type: KpiResponseDto,
  })
  async getKpiMetric(@Param("metric") metric: string): Promise<KpiResponseDto> {
    return this.kpiService.getKpiMetric(metric);
  }

  @Get("inventory/status")
  @ApiOperation({ summary: "Get real-time inventory status" })
  @ApiResponse({
    status: 200,
    description: "Inventory status retrieved successfully",
    type: InventoryStatusDto,
  })
  async getInventoryStatus(): Promise<InventoryStatusDto> {
    return this.inventoryService.getRealTimeStatus();
  }

  @Get("inventory/alerts")
  @ApiOperation({ summary: "Get inventory alerts and low stock warnings" })
  @ApiResponse({
    status: 200,
    description: "Inventory alerts retrieved successfully",
  })
  async getInventoryAlerts() {
    return this.inventoryService.getAlerts();
  }

  @Get("inventory/turnover")
  @ApiOperation({ summary: "Get inventory turnover rates" })
  @ApiResponse({
    status: 200,
    description: "Inventory turnover retrieved successfully",
  })
  @ApiQuery({
    name: "period",
    required: false,
    enum: ["month", "quarter", "year"],
  })
  async getInventoryTurnover(@Query("period") period: string = "month") {
    return this.inventoryService.getTurnoverRates(period);
  }

  @Get("trends/analysis")
  @ApiOperation({ summary: "Get trend analysis data" })
  @ApiResponse({
    status: 200,
    description: "Trend analysis retrieved successfully",
    type: TrendAnalysisDto,
  })
  @ApiQuery({
    name: "metric",
    required: false,
    enum: ["sales", "revenue", "customers", "orders"],
  })
  @ApiQuery({
    name: "period",
    required: false,
    enum: ["week", "month", "quarter", "year"],
  })
  async getTrendAnalysis(
    @Query("metric") metric: string = "sales",
    @Query("period") period: string = "month"
  ): Promise<TrendAnalysisDto> {
    return this.trendService.getAnalysis(metric, period);
  }

  @Get("trends/forecast")
  @ApiOperation({ summary: "Get trend forecast predictions" })
  @ApiResponse({
    status: 200,
    description: "Trend forecast retrieved successfully",
  })
  @ApiQuery({
    name: "metric",
    required: true,
    enum: ["sales", "revenue", "customers"],
  })
  @ApiQuery({ name: "days", required: false, type: "number" })
  async getTrendForecast(
    @Query("metric") metric: string,
    @Query("days") days: number = 30
  ) {
    return this.trendService.getForecast(metric, days);
  }

  @Get("trends/comparison")
  @ApiOperation({ summary: "Get period comparison trends" })
  @ApiResponse({
    status: 200,
    description: "Trend comparison retrieved successfully",
  })
  @ApiQuery({
    name: "current",
    required: false,
    enum: ["week", "month", "quarter"],
  })
  @ApiQuery({
    name: "previous",
    required: false,
    enum: ["week", "month", "quarter"],
  })
  async getTrendComparison(
    @Query("current") current: string = "month",
    @Query("previous") previous: string = "month"
  ) {
    return this.trendService.getComparison(current, previous);
  }
}
