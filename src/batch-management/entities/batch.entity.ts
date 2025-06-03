import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from "typeorm";
import { Product } from "../../products/entities/product.entity";

@Entity("batches")
export class Batch {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    batchNumber: string;

    @Column()
    productId: string;

    @ManyToOne(() => Product)
    product: Product;

    @Column()
    quantity: number;

    @Column()
    manufacturingDate: Date;

    @Column()
    expiryDate: Date;

    @Column({ default: false })
    isExpired: boolean;

    @Column({ default: false })
    isNotified: boolean;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    remainingQuantity: number;

    @Column({ type: "jsonb", nullable: true })
    metadata: Record<string, any>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
