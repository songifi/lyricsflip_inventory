import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  code: string;

  @Column({ length: 255 })
  contactEmail: string;

  @Column({ length: 50, nullable: true })
  contactPhone: string;

  @Column({ length: 255, nullable: true })
  contactPerson: string;

  @Column('text', { nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  state: string;

  @Column({ length: 20, nullable: true })
  zipCode: string;

  @Column({ length: 100, nullable: true })
  country: string;

  @Column({ length: 50, nullable: true })
  taxId: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('int', { default: 0 })
  rating: number; // 1-5 star rating

  @Column('text', { nullable: true })
  paymentTerms: string;

  @OneToMany(() => PurchaseOrder, order => order.supplier)
  orders: PurchaseOrder[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 