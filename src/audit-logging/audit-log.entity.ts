import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  READ = 'READ',
  BULK_UPDATE = 'BULK_UPDATE',
  BULK_DELETE = 'BULK_DELETE',
}

export enum AuditStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

@Entity('audit_logs')
@Index(['entityName', 'action', 'createdAt'])
@Index(['userId', 'createdAt'])
@Index(['sessionId', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'entity_name' })
  entityName: string;

  @Column({ name: 'entity_id', nullable: true })
  entityId: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({
    type: 'enum',
    enum: AuditStatus,
    default: AuditStatus.SUCCESS,
  })
  status: AuditStatus;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ name: 'user_email', nullable: true })
  userEmail: string;

  @Column({ name: 'session_id', nullable: true })
  sessionId: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValues: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newValues: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'transaction_id', nullable: true })
  transactionId: string;

  @Column({ name: 'correlation_id', nullable: true })
  correlationId: string;

  @Column({ name: 'error_message', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}