@Entity()
export class Supplier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  contactEmail: string;

  @OneToMany(() => PurchaseOrder, order => order.supplier)
  orders: PurchaseOrder[];
}
