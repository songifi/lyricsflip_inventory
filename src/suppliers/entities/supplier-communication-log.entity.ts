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

export enum CommunicationChannel {
  EMAIL = 'email',
  PHONE = 'phone',
  MEETING = 'meeting',
  PORTAL = 'portal',
  OTHER = 'other',
}

export enum CommunicationDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

/**
 * An append-only record of contact with a supplier.
 *
 * Entries are never updated or deleted: the log's value is that it reflects
 * what was actually said, which an editable record cannot guarantee.
 */
@Entity('supplier_communication_logs')
@Index(['supplierId', 'occurredAt'])
export class SupplierCommunicationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  supplierId: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.communications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'supplierId' })
  supplier?: Supplier;

  @Column({ type: 'enum', enum: CommunicationChannel })
  channel: CommunicationChannel;

  @Column({ type: 'enum', enum: CommunicationDirection })
  direction: CommunicationDirection;

  @Column({ length: 200 })
  subject: string;

  @Column({ type: 'text', nullable: true })
  body?: string | null;

  /** Contact this exchange was with, when it was a specific person. */
  @Column({ type: 'uuid', nullable: true })
  contactId?: string | null;

  /** User who recorded the entry. */
  @Column({ type: 'uuid', nullable: true })
  recordedBy?: string | null;

  /** When the exchange happened, which may predate when it was logged. */
  @Column({ type: 'timestamptz' })
  occurredAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
