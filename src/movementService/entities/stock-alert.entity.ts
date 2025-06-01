export enum AlertType {
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  OVERSTOCK = 'OVERSTOCK',
  EXPIRY_WARNING = 'EXPIRY_WARNING',
  MOVEMENT_FAILED = 'MOVEMENT_FAILED'
}

export enum AlertStatus {
  ACTIVE = 'ACTIVE',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED'
}

@Entity('stock_alerts')
export class StockAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AlertType })
  type: AlertType;

  @Column({ type: 'enum', enum: AlertStatus, default: AlertStatus.ACTIVE })
  status: AlertStatus;

  @Column({ type: 'varchar', length: 50 })
  productId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  locationId?: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  currentQuantity?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thresholdQuantity?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  acknowledgedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  acknowledgedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}