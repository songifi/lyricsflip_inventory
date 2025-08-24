import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
  RelationId,
} from 'typeorm';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';
import { LocationItem } from './location-item.entity';

export enum LocationType {
  WAREHOUSE = 'warehouse',
  ZONE = 'zone',
  SHELF = 'shelf',
}

@Entity('locations')
@Index(['type', 'parentId'])
@Index(['name'])
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @Column({ length: 60, nullable: true, unique: false })
  @IsOptional()
  @MaxLength(60)
  code?: string;

  @Column({ type: 'enum', enum: LocationType })
  @IsEnum(LocationType)
  type: LocationType;

  @ManyToOne(() => Location, (location) => location.children, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: Location | null;

  @RelationId((loc: Location) => loc.parent)
  parentId?: string | null;

  @OneToMany(() => Location, (location) => location.parent)
  children?: Location[];

  @OneToMany(() => LocationItem, (locationItem) => locationItem.location)
  locationItems?: LocationItem[];

  @Column({ type: 'integer', default: 0, name: 'capacity_units' })
  @Min(0)
  capacityUnits: number;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  description?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
