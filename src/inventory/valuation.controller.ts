import { Controller, Get, Param, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ValuationMethod } from './entities/valuation-record.entity';

@Controller('inventory/:sku/valuation')
export class ValuationController {
  constructor(private readonly inv: InventoryService) {}

  @Get()
  async calculate(
    @Param('sku') sku: string,
    @Query('method') method: ValuationMethod,
    @Query('asOf') asOf?: string,
  ) {
    const date = asOf ? new Date(asOf) : undefined;
    switch (method) {
      case ValuationMethod.FIFO:
        return this.inv.calculateFifo(sku, date);
      case ValuationMethod.LIFO:
        return this.inv.calculateLifo(sku, date);
      default:
        return this.inv.calculateAverage(sku, date);
    }
  }

  @Get('snapshot')
  async snapshot(
    @Param('sku') sku: string,
    @Query('method') method: ValuationMethod,
    @Query('asOf') asOf?: string,
  ) {
    const date = asOf ? new Date(asOf) : undefined;
    return this.inv.snapshotValuation(sku, method, date);
  }
}
