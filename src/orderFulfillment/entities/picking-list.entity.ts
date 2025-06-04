// orderFulfillment/entities/picking-list.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { PickingListItem } from './picking-list-item.entity';

@Entity('picking_lists')
export class PickingList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @Column({ default: 'pending' })
  status: string;

  @OneToMany(() => PickingListItem, item => item.pickingList)
  items: PickingListItem[];

  @CreateDateColumn()
  createdAt: Date;
}
