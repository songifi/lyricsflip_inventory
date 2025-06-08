import { PartialType } from '@nestjs/mapped-types';
import { CreateSalesOrderDto } from './create-sales-order.dto';
import { OrderStatus } from '../entities/sales-order.entity';

export class UpdateSalesOrderDto extends PartialType(CreateSalesOrderDto) {
  status?: OrderStatus;
}
