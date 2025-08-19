import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { InventoryItem } from './inventory-item.entity';

@Entity('inventory_item_images')
export class InventoryItemImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  inventoryItemId: string;

  @ManyToOne(() => InventoryItem, (item) => item.images, { onDelete: 'CASCADE' })
  inventoryItem: InventoryItem;

  @Column({ length: 255 })
  filename: string;

  @Column({ length: 500 })
  url: string;

  @Column({ length: 50 })
  mimetype: string;

  @Column({ type: 'int' })
  size: number;

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
