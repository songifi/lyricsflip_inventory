import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { StorageLocation } from './storage-location.entity';
import { User } from './user.entity';
import { CycleCountItem } from './cycle-count-item.entity';

export enum CycleCountStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Entity('cycle_counts')
export class CycleCount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  countNumber: string;

  @Column({
    type: 'enum',
    enum: CycleCountStatus,
    default: CycleCountStatus.SCHEDULED
  })
  status: CycleCountStatus;

  @Column('uuid')
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({ type: 'uuid', nullable: true })
  locationId: string;

  @ManyToOne(() => StorageLocation, { nullable: true })
  @JoinColumn({ name: 'locationId' })
  location: StorageLocation;

  @Column({ type: 'uuid', nullable: true })
  assignedUserId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedUserId' })
  assignedUser: User;

  @Column({ type: 'date' })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => CycleCountItem, item => item.cycleCount, { cascade: true })
  items: CycleCountItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

