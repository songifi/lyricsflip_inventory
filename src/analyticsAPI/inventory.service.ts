// analyticsAPI/inventory.service.ts
import { Injectable } from "@nestjs/common";
import { InventoryStatusDto } from "./dto/analytics.dto";

@Injectable()
export class InventoryService {
  async getRealTimeStatus(): Promise<InventoryStatusDto> {
    return {
      totalProducts: this.generateMockValue(500, 1200),
      inStock: this.generateMockValue(400, 1000),
      lowStock: this.generateMockValue(20, 80),
      outOfStock: this.generateMockValue(5, 30),
      totalValue: this.generateMockValue(100000, 500000),
      lastUpdated: new Date().toISOString(),
      categoryBreakdown: [
        {
          category: "Electronics",
          count: this.generateMockValue(50, 150),
          value: this.generateMockValue(20000, 80000),
        },
        {
          category: "Clothing",
          count: this.generateMockValue(100, 300),
          value: this.generateMockValue(15000, 60000),
        },
        {
          category: "Home & Garden",
          count: this.generateMockValue(80, 200),
          value: this.generateMockValue(10000, 40000),
        },
        {
          category: "Sports",
          count: this.generateMockValue(40, 120),
          value: this.generateMockValue(8000, 30000),
        },
      ],
      alerts: [
        {
          productId: "prod_001",
          productName: "Product A",
          currentStock: 5,
          threshold: 10,
          severity: "high",
        },
        {
          productId: "prod_002",
          productName: "Product B",
          currentStock: 15,
          threshold: 20,
          severity: "medium",
        },
        {
          productId: "prod_003",
          productName: "Product C",
          currentStock: 0,
          threshold: 5,
          severity: "critical",
        },
      ],
    };
  }

  async getAlerts() {
    const status = await this.getRealTimeStatus();
    return {
      critical: status.alerts.filter((alert) => alert.severity === "critical"),
      high: status.alerts.filter((alert) => alert.severity === "high"),
      medium: status.alerts.filter((alert) => alert.severity === "medium"),
      totalAlerts: status.alerts.length,
    };
  }

  async getTurnoverRates(period: string) {
    return {
      period,
      overallTurnover: parseFloat((Math.random() * 8 + 4).toFixed(2)),
      categoryTurnover: [
        {
          category: "Electronics",
          rate: parseFloat((Math.random() * 6 + 6).toFixed(2)),
        },
        {
          category: "Clothing",
          rate: parseFloat((Math.random() * 4 + 8).toFixed(2)),
        },
        {
          category: "Home & Garden",
          rate: parseFloat((Math.random() * 3 + 4).toFixed(2)),
        },
        {
          category: "Sports",
          rate: parseFloat((Math.random() * 5 + 5).toFixed(2)),
        },
      ],
      trend: Array.from({ length: 6 }, (_, i) => ({
        period: `${period} ${i + 1}`,
        rate: parseFloat((Math.random() * 4 + 6).toFixed(2)),
      })),
    };
  }

  private generateMockValue(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
