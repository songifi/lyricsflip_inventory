import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReportType, ReportFormat, ScheduleFrequency } from '../enums/report.enum';
import { ReportConfig } from '../interfaces/report-config.interface';

@Entity('report_schedules')
export class ReportSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ReportType })
  reportType: ReportType;

  @Column({ type: 'enum', enum: ReportFormat, default: ReportFormat.JSON })
  format: ReportFormat;

  @Column({ type: 'enum', enum: ScheduleFrequency })
  frequency: ScheduleFrequency;

  @Column({ type: 'json' })
  config: ReportConfig;

  @Column({ type: 'simple-array', nullable: true })
  recipients: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  nextRunAt: Date;

  @Column({ nullable: true })
  lastRunAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
