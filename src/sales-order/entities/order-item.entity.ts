import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { SalesOrder } from './sales-order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @Column('int')
  quantity: number;

  @ManyToOne(() => SalesOrder, order => order.items, { onDelete: 'CASCADE' })
  order: SalesOrder;
}
