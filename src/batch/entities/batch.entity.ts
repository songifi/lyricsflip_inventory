import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';

@Entity('batches')
export class Batch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  lotNumber: string;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, product => product.batches)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'date' })
  manufacturingDate: Date;

  @Column({ type: 'date' })
  expiryDate: Date;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar', nullable: true })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
