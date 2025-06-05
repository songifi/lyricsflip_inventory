import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Product } from "../../products/entities/product.entity";

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
  })
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @ManyToMany(() => Product, (product) => product.categories)
  @JoinTable({
    name: "product_categories",
    joinColumn: { name: "category_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "product_id", referencedColumnName: "id" },
  })
  products: Product[];
}
