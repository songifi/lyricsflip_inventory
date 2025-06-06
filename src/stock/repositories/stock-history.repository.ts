import { EntityRepository, Repository, Between } from "typeorm"
import { StockHistory } from "../entities/stock-history.entity"

@EntityRepository(StockHistory)
export class StockHistoryRepository extends Repository<StockHistory> {
  async findByStockLevelId(stockLevelId: string): Promise<StockHistory[]> {
    return this.find({
      where: { stockLevelId },
      order: { timestamp: "DESC" },
    })
  }

  async findByDateRange(stockLevelId: string, startDate: Date, endDate: Date): Promise<StockHistory[]> {
    return this.find({
      where: {
        stockLevelId,
        timestamp: Between(startDate, endDate),
      },
      order: { timestamp: "DESC" },
    })
  }

  async getStockMovementSummary(stockLevelId: string, days: number): Promise<any> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const result = await this.createQueryBuilder("history")
      .select("history.type", "type")
      .addSelect("SUM(history.quantityChanged)", "totalQuantity")
      .where("history.stockLevelId = :stockLevelId", { stockLevelId })
      .andWhere("history.timestamp BETWEEN :startDate AND :endDate", { startDate, endDate })
      .groupBy("history.type")
      .getRawMany()

    return result
  }
}
