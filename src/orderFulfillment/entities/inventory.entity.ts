// orderFulfillment/entities/inventory.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  productId: string;

  @Column()
  quantity: number;

  @Column({ nullable: true })
  location: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  unitCost: number;

  @UpdateDateColumn()
  lastUpdated: Date;
}
