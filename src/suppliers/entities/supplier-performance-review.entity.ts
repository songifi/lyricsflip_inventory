import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Supplier } from './supplier.entity';

/**
 * One performance review of a supplier.
 *
 * Scores are 1–5. `overall` is stored rather than derived so a reviewer can
 * disagree with the average of the components — a supplier who is cheap, fast
 * and unreliable is not a 4.
 */
@Entity('supplier_performance_reviews')
@Index(['supplierId', 'createdAt'])
export class SupplierPerformanceReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  supplierId: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'supplierId' })
  supplier?: Supplier;

  @Column({ type: 'int' })
  overall: number;

  @Column({ type: 'int', nullable: true })
  quality?: number | null;

  @Column({ type: 'int', nullable: true })
  delivery?: number | null;

  @Column({ type: 'int', nullable: true })
  pricing?: number | null;

  @Column({ type: 'int', nullable: true })
  communication?: number | null;

  @Column({ length: 1000, nullable: true })
  comment?: string | null;

  /** Purchase order this review relates to, when it relates to one. */
  @Column({ type: 'uuid', nullable: true })
  purchaseOrderId?: string | null;

  @Column({ type: 'uuid', nullable: true })
  reviewedBy?: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
