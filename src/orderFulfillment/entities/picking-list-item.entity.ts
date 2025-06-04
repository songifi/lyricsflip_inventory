
// orderFulfillment/entities/picking-list-item.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PickingList } from './picking-list.entity';

@Entity('picking_list_items')
export class PickingListItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pickingListId: string;

  @Column()
  productId: string;

  @Column()
  quantity: number;

  @Column()
  location: string;

  @Column({ default: 'pending' })
  status: string;

  @ManyToOne(() => PickingList, pickingList => pickingList.items)
  @JoinColumn({ name: 'pickingListId' })
  pickingList: PickingList;
}