import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ReportStrategy } from "./sales-report.strategy";
import { Item } from "../entities/item.entity";

@Injectable()
export class InventoryReportStrategy implements ReportStrategy {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
  ) {}

  async generate(config: any): Promise<any[]> {
    return this.itemRepo
      .createQueryBuilder('item')
      .select(['item.category AS category'])
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(item.quantity)', 'totalQty')
      .groupBy('item.category')
      .getRawMany();
  }
}
