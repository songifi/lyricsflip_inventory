// analyticsAPI/kpi.service.ts
import { Injectable } from "@nestjs/common";
import { KpiResponseDto } from "./dto/analytics.dto";

@Injectable()
export class KpiService {
  async getKpis(
    category?: string,
    period: string = "month"
  ): Promise<KpiResponseDto[]> {
    const allKpis = [
      // Sales KPIs
      {
        id: "total_sales",
        name: "Total Sales",
        value: this.generateMockValue(25000, 75000),
        unit: "currency",
        category: "sales",
        change: parseFloat((Math.random() * 20 - 10).toFixed(2)),
        target: 60000,
        period,
      },
      {
        id: "conversion_rate",
        name: "Conversion Rate",
        value: parseFloat((Math.random() * 5 + 2).toFixed(2)),
        unit: "percentage",
        category: "sales",
        change: parseFloat((Math.random() * 2 - 1).toFixed(2)),
        target: 5.0,
        period,
      },
      // Inventory KPIs
      {
        id: "inventory_turnover",
        name: "Inventory Turnover",
        value: parseFloat((Math.random() * 8 + 4).toFixed(2)),
        unit: "ratio",
        category: "inventory",
        change: parseFloat((Math.random() * 1 - 0.5).toFixed(2)),
        target: 8.0,
        period,
      },
      {
        id: "stock_level",
        name: "Stock Level",
        value: this.generateMockValue(80, 95),
        unit: "percentage",
        category: "inventory",
        change: parseFloat((Math.random() * 10 - 5).toFixed(2)),
        target: 90,
        period,
      },
      // Customer KPIs
      {
        id: "customer_acquisition",
        name: "New Customers",
        value: this.generateMockValue(150, 400),
        unit: "count",
        category: "customer",
        change: parseFloat((Math.random() * 25 - 12).toFixed(2)),
        target: 300,
        period,
      },
      {
        id: "customer_retention",
        name: "Customer Retention",
        value: parseFloat((Math.random() * 20 + 75).toFixed(2)),
        unit: "percentage",
        category: "customer",
        change: parseFloat((Math.random() * 5 - 2).toFixed(2)),
        target: 85,
        period,
      },
      // Financial KPIs
      {
        id: "gross_margin",
        name: "Gross Margin",
        value: parseFloat((Math.random() * 15 + 35).toFixed(2)),
        unit: "percentage",
        category: "financial",
        change: parseFloat((Math.random() * 3 - 1.5).toFixed(2)),
        target: 45,
        period,
      },
    ];

    return category
      ? allKpis.filter((kpi) => kpi.category === category)
      : allKpis;
  }

  async getKpiMetric(metric: string): Promise<KpiResponseDto> {
    const kpis = await this.getKpis();
    const kpi = kpis.find((k) => k.id === metric);

    if (!kpi) {
      throw new Error(`KPI metric '${metric}' not found`);
    }

    return {
      ...kpi,
      history: Array.from({ length: 12 }, (_, i) => ({
        period: `Period ${i + 1}`,
        value: this.generateMockValue(kpi.value * 0.8, kpi.value * 1.2),
      })),
    };
  }

  private generateMockValue(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
