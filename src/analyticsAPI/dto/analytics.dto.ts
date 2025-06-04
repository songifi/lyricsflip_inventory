// analyticsAPI/dto/analytics.dto.ts
import { ApiProperty } from "@nestjs/swagger";

export class DashboardSummaryDto {
  @ApiProperty({ description: "Total revenue for the period" })
  totalRevenue: number;

  @ApiProperty({ description: "Total number of orders" })
  totalOrders: number;

  @ApiProperty({ description: "Total number of customers" })
  totalCustomers: number;

  @ApiProperty({ description: "Average order value" })
  averageOrderValue: number;

  @ApiProperty({ description: "Conversion rate percentage" })
  conversionRate: number;

  @ApiProperty({ description: "Time period for the summary" })
  period: string;

  @ApiProperty({ description: "Period-over-period comparison" })
  periodComparison: {
    revenue: number;
    orders: number;
    customers: number;
  };

  @ApiProperty({ description: "Top performing products" })
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;

  @ApiProperty({ description: "Recent activity feed" })
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export class KpiResponseDto {
  @ApiProperty({ description: "KPI identifier" })
  id: string;

  @ApiProperty({ description: "KPI display name" })
  name: string;

  @ApiProperty({ description: "Current KPI value" })
  value: number;

  @ApiProperty({ description: "Unit of measurement" })
  unit: string;

  @ApiProperty({ description: "KPI category" })
  category: string;

  @ApiProperty({ description: "Percentage change from previous period" })
  change: number;

  @ApiProperty({ description: "Target value for this KPI" })
  target: number;

  @ApiProperty({ description: "Time period" })
  period: string;

  @ApiProperty({ description: "Historical data points", required: false })
  history?: Array<{
    period: string;
    value: number;
  }>;
}

export class InventoryStatusDto {
  @ApiProperty({ description: "Total number of products" })
  totalProducts: number;

  @ApiProperty({ description: "Products currently in stock" })
  inStock: number;

  @ApiProperty({ description: "Products with low stock" })
  lowStock: number;

  @ApiProperty({ description: "Products out of stock" })
  outOfStock: number;

  @ApiProperty({ description: "Total inventory value" })
  totalValue: number;

  @ApiProperty({ description: "Last update timestamp" })
  lastUpdated: string;

  @ApiProperty({ description: "Inventory breakdown by category" })
  categoryBreakdown: Array<{
    category: string;
    count: number;
    value: number;
  }>;

  @ApiProperty({ description: "Stock alerts" })
  alerts: Array<{
    productId: string;
    productName: string;
    currentStock: number;
    threshold: number;
    severity: string;
  }>;
}

export class TrendAnalysisDto {
  @ApiProperty({ description: "Metric being analyzed" })
  metric: string;

  @ApiProperty({ description: "Time period" })
  period: string;

  @ApiProperty({ description: "Data points for the trend" })
  dataPoints: Array<{
    date: string;
    value: number;
  }>;

  @ApiProperty({ description: "Overall trend direction" })
  trend: string;

  @ApiProperty({ description: "Growth percentage" })
  growth: number;

  @ApiProperty({ description: "Seasonality detected" })
  seasonality: boolean;

  @ApiProperty({ description: "Forecast data points" })
  forecast: Array<{
    date: string;
    value: number;
    confidence: number;
  }>;

  @ApiProperty({ description: "Generated insights" })
  insights: string[];
}
