import { EntityRepository, Repository } from "typeorm"
import { StockLevel } from "../entities/stock-level.entity"
import type { StockLevelQueryDto, StockStatus } from "../dto/stock-level-query.dto"

@EntityRepository(StockLevel)
export class StockLevelRepository extends Repository<StockLevel> {
  async findByProductId(productId: string): Promise<StockLevel[]> {
    return this.find({
      where: { productId },
      relations: ["product"],
    })
  }

  async findByStatus(status: StockStatus): Promise<StockLevel[]> {
    return this.find({
      where: { status },
      relations: ["product"],
    })
  }

  async findLowStock(): Promise<StockLevel[]> {
    return this.createQueryBuilder("stockLevel")
      .leftJoinAndSelect("stockLevel.product", "product")
      .where("stockLevel.currentQuantity <= stockLevel.minimumThreshold")
      .andWhere("stockLevel.alertEnabled = :alertEnabled", { alertEnabled: true })
      .getMany()
  }

  async findByQuery(queryDto: StockLevelQueryDto): Promise<StockLevel[]> {
    const { productId, location, status } = queryDto
    const query = this.createQueryBuilder("stockLevel").leftJoinAndSelect("stockLevel.product", "product")

    if (productId) {
      query.andWhere("stockLevel.productId = :productId", { productId })
    }

    if (location) {
      query.andWhere("stockLevel.location = :location", { location })
    }

    if (status) {
      query.andWhere("stockLevel.status = :status", { status })
    }

    return query.getMany()
  }
}
