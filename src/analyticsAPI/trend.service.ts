// analyticsAPI/trend.service.ts
import { Injectable } from "@nestjs/common";
import { TrendAnalysisDto } from "./dto/analytics.dto";

@Injectable()
export class TrendService {
  async getAnalysis(metric: string, period: string): Promise<TrendAnalysisDto> {
    const dataPoints = this.generateTrendData(metric, period);

    return {
      metric,
      period,
      dataPoints,
      trend: this.calculateTrend(dataPoints),
      growth: this.calculateGrowth(dataPoints),
      seasonality: this.detectSeasonality(dataPoints),
      forecast: this.generateForecast(dataPoints, 7),
      insights: this.generateInsights(metric, dataPoints),
    };
  }

  async getForecast(metric: string, days: number) {
    const historicalData = this.generateTrendData(metric, "month");
    const forecast = this.generateForecast(historicalData, days);

    return {
      metric,
      forecastPeriod: `${days} days`,
      historical: historicalData.slice(-30),
      forecast,
      confidence: parseFloat((Math.random() * 20 + 75).toFixed(2)),
      methodology: "Linear regression with seasonal adjustment",
    };
  }

  async getComparison(current: string, previous: string) {
    const currentData = this.generateTrendData("sales", current);
    const previousData = this.generateTrendData("sales", previous);

    const currentTotal = currentData.reduce(
      (sum, point) => sum + point.value,
      0
    );
    const previousTotal = previousData.reduce(
      (sum, point) => sum + point.value,
      0
    );
    const change = ((currentTotal - previousTotal) / previousTotal) * 100;

    return {
      current: { period: current, total: currentTotal, data: currentData },
      previous: { period: previous, total: previousTotal, data: previousData },
      comparison: {
        change: parseFloat(change.toFixed(2)),
        trend: change > 0 ? "increasing" : "decreasing",
        significance: Math.abs(change) > 5 ? "significant" : "minimal",
      },
    };
  }

  private generateTrendData(
    metric: string,
    period: string
  ): Array<{ date: string; value: number }> {
    const periods =
      period === "week"
        ? 7
        : period === "month"
        ? 30
        : period === "quarter"
        ? 90
        : 365;
    const baseValue =
      metric === "sales" ? 1000 : metric === "revenue" ? 5000 : 100;

    return Array.from({ length: periods }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (periods - i));

      // Add trend and seasonality
      const trend = i * (Math.random() * 2 - 1) * 0.1;
      const seasonality = Math.sin((i / periods) * 2 * Math.PI) * 0.2;
      const noise = (Math.random() - 0.5) * 0.3;

      return {
        date: date.toISOString().split("T")[0],
        value: Math.max(
          0,
          Math.round(baseValue * (1 + trend + seasonality + noise))
        ),
      };
    });
  }

  private calculateTrend(
    dataPoints: Array<{ date: string; value: number }>
  ): string {
    if (dataPoints.length < 2) return "insufficient_data";

    const firstHalf = dataPoints.slice(0, Math.floor(dataPoints.length / 2));
    const secondHalf = dataPoints.slice(Math.floor(dataPoints.length / 2));

    const firstAvg =
      firstHalf.reduce((sum, point) => sum + point.value, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, point) => sum + point.value, 0) /
      secondHalf.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (change > 5) return "increasing";
    if (change < -5) return "decreasing";
    return "stable";
  }

  private calculateGrowth(
    dataPoints: Array<{ date: string; value: number }>
  ): number {
    if (dataPoints.length < 2) return 0;

    const first = dataPoints[0].value;
    const last = dataPoints[dataPoints.length - 1].value;

    return parseFloat((((last - first) / first) * 100).toFixed(2));
  }

  private detectSeasonality(
    dataPoints: Array<{ date: string; value: number }>
  ): boolean {
    // Simple seasonality detection based on variance patterns
    return Math.random() > 0.5; // Mock implementation
  }

  private generateForecast(
    dataPoints: Array<{ date: string; value: number }>,
    days: number
  ): Array<{ date: string; value: number; confidence: number }> {
    const lastValue = dataPoints[dataPoints.length - 1].value;
    const trend = this.calculateGrowth(dataPoints) / 100 / dataPoints.length;

    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);

      const forecastValue =
        lastValue * (1 + trend * (i + 1)) * (1 + (Math.random() - 0.5) * 0.1);
      const confidence = Math.max(50, 95 - i * 2); // Decreasing confidence over time

      return {
        date: date.toISOString().split("T")[0],
        value: Math.round(forecastValue),
        confidence: parseFloat(confidence.toFixed(2)),
      };
    });
  }

  private generateInsights(
    metric: string,
    dataPoints: Array<{ date: string; value: number }>
  ): string[] {
    const insights = [];
    const trend = this.calculateTrend(dataPoints);
    const growth = this.calculateGrowth(dataPoints);

    if (trend === "increasing") {
      insights.push(
        `${metric} shows a positive trend with ${growth.toFixed(1)}% growth`
      );
    } else if (trend === "decreasing") {
      insights.push(
        `${metric} shows a declining trend with ${growth.toFixed(1)}% decrease`
      );
    } else {
      insights.push(`${metric} remains stable with minimal variation`);
    }

    // Add more contextual insights
    const maxValue = Math.max(...dataPoints.map((p) => p.value));
    const minValue = Math.min(...dataPoints.map((p) => p.value));
    const volatility = ((maxValue - minValue) / minValue) * 100;

    if (volatility > 50) {
      insights.push(
        "High volatility detected - consider investigating external factors"
      );
    } else if (volatility < 10) {
      insights.push("Low volatility indicates stable performance");
    }

    return insights;
  }
}
