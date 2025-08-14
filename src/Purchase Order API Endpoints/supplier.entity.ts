import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { PurchaseOrder } from "./purchase-order.entity";

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
