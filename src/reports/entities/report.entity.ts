import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReportType, ReportStatus, ReportFormat } from '../enums/report.enum';
import { ReportConfig } from '../interfaces/report-config.interface';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ReportType })
  type: ReportType;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;

  @Column({ type: 'enum', enum: ReportFormat, default: ReportFormat.JSON })
  format: ReportFormat;

  @Column({ type: 'json', nullable: true })
  config: ReportConfig;

  @Column({ type: 'json', nullable: true })
  data: any;

  @Column({ nullable: true })
  filePath: string;

  @Column({ nullable: true })
  downloadUrl: string;

  @Column({ nullable: true })
  error: string;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;
}
