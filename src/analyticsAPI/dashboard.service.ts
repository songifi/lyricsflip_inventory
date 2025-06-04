// analyticsAPI/dashboard.service.ts
import { Injectable } from "@nestjs/common";
import { DashboardSummaryDto } from "./dto/analytics.dto";

@Injectable()
export class DashboardService {
  async getSummary(period: string): Promise<DashboardSummaryDto> {
    // Mock data - replace with actual database queries
    const mockData: DashboardSummaryDto = {
      totalRevenue: this.generateMockValue(50000, 150000),
      totalOrders: this.generateMockValue(1200, 3000),
      totalCustomers: this.generateMockValue(800, 2000),
      averageOrderValue: this.generateMockValue(40, 120),
      conversionRate: parseFloat((Math.random() * 5 + 2).toFixed(2)),
      period,
      periodComparison: {
        revenue: parseFloat((Math.random() * 20 - 10).toFixed(2)),
        orders: parseFloat((Math.random() * 15 - 7).toFixed(2)),
        customers: parseFloat((Math.random() * 25 - 12).toFixed(2)),
      },
      topProducts: Array.from({ length: 5 }, (_, i) => ({
        id: `prod_${i + 1}`,
        name: `Product ${i + 1}`,
        sales: this.generateMockValue(100, 500),
        revenue: this.generateMockValue(2000, 8000),
      })),
      recentActivity: Array.from({ length: 10 }, (_, i) => ({
        id: `activity_${i + 1}`,
        type: ["order", "customer", "product"][Math.floor(Math.random() * 3)],
        description: `Activity ${i + 1} description`,
        timestamp: new Date(
          Date.now() - Math.random() * 86400000 * 7
        ).toISOString(),
      })),
    };

    return mockData;
  }

  async getOverview() {
    return {
      summary: await this.getSummary("month"),
      quickStats: {
        todayOrders: this.generateMockValue(50, 150),
        todayRevenue: this.generateMockValue(2000, 8000),
        activeUsers: this.generateMockValue(100, 300),
        pendingOrders: this.generateMockValue(10, 50),
      },
      alerts: [
        { type: "warning", message: "Low stock alert for 3 products" },
        { type: "info", message: "Monthly report is ready" },
      ],
    };
  }

  private generateMockValue(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
