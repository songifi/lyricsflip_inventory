import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('custom_reports')
export class CustomReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('json')
  fields: string[];

  @Column('json')
  filters: Record<string, any>;

  @Column('json', { nullable: true })
  groupBy: string[];

  @Column('json', { nullable: true })
  orderBy: Record<string, string>;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}