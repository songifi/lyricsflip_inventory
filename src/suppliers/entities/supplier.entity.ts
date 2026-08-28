import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SupplierContact } from './supplier-contact.entity';
import { SupplierCommunicationLog } from './supplier-communication-log.entity';
import { SupplierPerformanceReview } from './supplier-performance-review.entity';

/**
 * Lifecycle of a supplier relationship.
 *
 * `ARCHIVED` is terminal — an archived supplier keeps its history for the
 * purchase orders that reference it, but can never be ordered from again.
 */
export enum SupplierStatus {
  /** Onboarding; not yet approved to receive orders. */
  PENDING = 'pending',
  /** Approved and orderable. */
  ACTIVE = 'active',
  /** Temporarily blocked, e.g. a quality hold. Reversible. */
  SUSPENDED = 'suspended',
  /** Relationship ended. Terminal. */
  ARCHIVED = 'archived',
}

@Entity('suppliers')
@Index(['companyId', 'name'], { unique: true })
@Index(['companyId', 'status'])
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  companyId: string;

  @Column({ length: 150 })
  name: string;

  /** Supplier's own code for this account, when they issue one. */
  @Column({ length: 50, nullable: true })
  code?: string | null;

  @Column({ length: 500, nullable: true })
  description?: string | null;

  // ─── Primary contact details ───────────────────────────────────────────────

  @Column({ length: 150, nullable: true })
  email?: string | null;

  @Column({ length: 30, nullable: true })
  phone?: string | null;

  @Column({ length: 200, nullable: true })
  website?: string | null;

  @Column({ length: 250, nullable: true })
  addressLine1?: string | null;

  @Column({ length: 250, nullable: true })
  addressLine2?: string | null;

  @Column({ length: 100, nullable: true })
  city?: string | null;

  @Column({ length: 100, nullable: true })
  state?: string | null;

  @Column({ length: 20, nullable: true })
  postalCode?: string | null;

  @Column({ length: 100, nullable: true })
  country?: string | null;

  // ─── Commercial terms ──────────────────────────────────────────────────────

  @Column({ length: 100, nullable: true })
  paymentTerms?: string | null;

  @Column({ length: 3, nullable: true })
  currency?: string | null;

  /** Typical lead time in days, used for reorder planning. */
  @Column({ type: 'int', nullable: true })
  leadTimeDays?: number | null;

  // ─── Status and performance ────────────────────────────────────────────────

  @Column({
    type: 'enum',
    enum: SupplierStatus,
    default: SupplierStatus.PENDING,
  })
  status: SupplierStatus;

  /**
   * Mean of every review's overall rating, 1–5, or `null` before the first
   * review. Denormalised so a supplier list does not need an aggregate per row;
   * `SuppliersService.recalculateRating` is the only writer.
   */
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating?: string | null;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @OneToMany(() => SupplierContact, (contact) => contact.supplier, {
    cascade: true,
  })
  contacts?: SupplierContact[];

  @OneToMany(() => SupplierCommunicationLog, (log) => log.supplier, {
    cascade: true,
  })
  communications?: SupplierCommunicationLog[];

  @OneToMany(() => SupplierPerformanceReview, (review) => review.supplier, {
    cascade: true,
  })
  reviews?: SupplierPerformanceReview[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
