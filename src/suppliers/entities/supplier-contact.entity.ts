import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Supplier } from './supplier.entity';

/** A named person at a supplier, beyond the account-level details. */
@Entity('supplier_contacts')
@Index(['supplierId', 'isPrimary'])
export class SupplierContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  supplierId: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.contacts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'supplierId' })
  supplier?: Supplier;

  @Column({ length: 150 })
  name: string;

  /** Job title or function, e.g. "Account Manager". */
  @Column({ length: 100, nullable: true })
  role?: string | null;

  @Column({ length: 150, nullable: true })
  email?: string | null;

  @Column({ length: 30, nullable: true })
  phone?: string | null;

  /**
   * At most one primary contact per supplier. The service demotes the previous
   * primary rather than relying on a partial unique index, which not every
   * supported database expresses the same way.
   */
  @Column({ type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ length: 500, nullable: true })
  notes?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
