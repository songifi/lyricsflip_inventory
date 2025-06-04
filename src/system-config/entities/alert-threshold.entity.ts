import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AlertSeverity {
  CRITICAL = 'critical',
  WARNING = 'warning',
  INFO = 'info'
}

export enum AlertCategory {
  INVENTORY = 'inventory',
  SYSTEM = 'system',
  SECURITY = 'security',
  PERFORMANCE = 'performance'
}

@Entity('alert_thresholds')
export class AlertThreshold {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: AlertCategory,
    default: AlertCategory.INVENTORY
  })
  category: AlertCategory;

  @Column({
    type: 'enum',
    enum: AlertSeverity,
    default: AlertSeverity.WARNING
  })
  severity: AlertSeverity;

  @Column('float')
  threshold: number;

  @Column({ default: '>' })
  operator: string; // >, <, >=, <=, ==, !=

  @Column({ nullable: true })
  unit: string;

  @Column('json', { nullable: true })
  notificationConfig: any;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
