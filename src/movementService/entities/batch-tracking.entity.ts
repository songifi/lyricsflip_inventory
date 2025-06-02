@Entity('batch_tracking')
export class BatchTracking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  productId: string;

  @Column({ type: 'varchar', length: 50 })
  locationId: string;

  @Column({ type: 'varchar', length: 100 })
  batchNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'date', nullable: true })
  manufacturedDate?: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  supplierId?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  unitCost?: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
