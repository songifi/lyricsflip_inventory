import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum FileCategory {
  PRODUCT_IMAGE = "product_image",
  DOCUMENT = "document",
  MISC = "misc",
}

@Entity("file_metadata")
export class FileMetadata {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  originalName: string;

  @Column()
  filename: string;

  @Column()
  path: string;

  @Column()
  mimeType: string;

  @Column("bigint")
  size: number;

  @Column({
    type: "enum",
    enum: FileCategory,
    default: FileCategory.MISC,
  })
  category: FileCategory;

  @Column({ nullable: true })
  relatedEntityId?: string;

  @Column({ nullable: true })
  relatedEntityType?: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
