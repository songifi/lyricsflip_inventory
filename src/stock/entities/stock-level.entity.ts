import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Product } from "./product.entity";
import { StockHistory } from "./stock-history.entity";

@Entity("stock_levels")
export class StockLevel {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  productId: string;

  @JoinColumn({ name: "productId" })
  product: Product;

  @Column({ type: "int" })
  currentQuantity: number;

  @Column({ type: "int" })
  minimumThreshold: number;

  @Column({ type: "int", nullable: true })
  maximumThreshold: number;

  @Column({ type: "varchar", length: 50, default: "available" })
  status: "available" | "low" | "out_of_stock" | "overstocked";

  @Column({ type: "varchar", length: 255, nullable: true })
  location: string;

  @Column({ type: "boolean", default: false })
  alertEnabled: boolean;

  @Column({ type: "int", nullable: true })
  reorderQuantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
