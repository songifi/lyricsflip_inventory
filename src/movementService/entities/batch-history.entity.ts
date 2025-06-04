import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('batch_history')
export class BatchHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  batchId: string;

  @Column({ type: 'varchar', length: 50 })
  action: string; // e.g. CREATED, UPDATED, EXPIRED

  @Column({ type: 'json', nullable: true })
  details?: any;

  @CreateDateColumn()
  createdAt: Date;
}
