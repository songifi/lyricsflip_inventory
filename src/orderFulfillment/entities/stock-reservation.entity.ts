// orderFulfillment/entities/stock-reservation.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('stock_reservations')
export class StockReservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @Column()
  quantity: number;

  @Column()
  orderId: string;

  @Column({ default: 'active' })
  status: string;

  @CreateDateColumn()
  reservedAt: Date;
}