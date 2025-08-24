import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { IsOptional, Min } from 'class-validator';
import { Location } from './location.entity';
import { InventoryItem } from '../../inventory-items/inventory-item.entity';

@Entity('location_items')
@Index(['locationId', 'itemId'], { unique: true })
export class LocationItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Location, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @RelationId((li: LocationItem) => li.location)
  locationId: string;

  @ManyToOne(() => InventoryItem, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'item_id' })
  item: InventoryItem;

  @RelationId((li: LocationItem) => li.item)
  itemId: string;

  @Column({ type: 'integer', default: 0 })
  @Min(0)
  quantity: number;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  metadata?: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
