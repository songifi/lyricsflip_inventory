import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesOrder, OrderStatus } from './entities/sales-order.entity';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class SalesOrderService {
  constructor(
    @InjectRepository(SalesOrder)
    private readonly ordersRepo: Repository<SalesOrder>,
    private readonly inventoryService: InventoryService,
  ) {}

  async create(dto: CreateSalesOrderDto): Promise<SalesOrder> {
    const order = this.ordersRepo.create({ ...dto, status: OrderStatus.PENDING });
    const saved = await this.ordersRepo.save(order);

    // reserve inventory
    try {
      await this.inventoryService.reserveItems(dto.items);
      saved.status = OrderStatus.RESERVED;
      await this.ordersRepo.save(saved);
    } catch (err) {
      // if reservation fails, cancel order
      saved.status = OrderStatus.CANCELLED;
      await this.ordersRepo.save(saved);
      throw new BadRequestException('Inventory reservation failed');
    }

    return saved;
  }

  findAll(): Promise<SalesOrder[]> {
    return this.ordersRepo.find();
  }

  async findOne(id: string): Promise<SalesOrder> {
    const o = await this.ordersRepo.findOne(id);
    if (!o) throw new NotFoundException(`Order ${id} not found`);
    return o;
  }

  async update(id: string, dto: UpdateSalesOrderDto): Promise<SalesOrder> {
    const o = await this.findOne(id);
    if (dto.status === OrderStatus.FULFILLED && o.status !== OrderStatus.RESERVED) {
      throw new BadRequestException('Can only fulfill reserved orders');
    }

    if (dto.status === OrderStatus.CANCELLED && o.status === OrderStatus.RESERVED) {
      // release inventory
      await this.inventoryService.releaseItems(o.items);
    }

    Object.assign(o, dto);
    return this.ordersRepo.save(o);
  }

  async remove(id: string): Promise<void> {
    await this.ordersRepo.delete(id);
  }
}
