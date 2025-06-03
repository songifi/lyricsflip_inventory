@Entity()
export class PurchaseOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  item: string;

  @Column('int')
  quantity: number;

  @Column('decimal')
  price: number;

  @Column()
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RECEIVED';

  @ManyToOne(() => Supplier, supplier => supplier.orders)
  supplier: Supplier;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
