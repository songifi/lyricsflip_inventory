import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum IntegrationType {
  API = 'api',
  DATABASE = 'database',
  MESSAGING = 'messaging',
  PAYMENT = 'payment',
  NOTIFICATION = 'notification',
  OTHER = 'other'
}

@Entity('integration_settings')
export class IntegrationSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  key: string;

  @Column({
    type: 'enum',
    enum: IntegrationType,
    default: IntegrationType.API
  })
  type: IntegrationType;

  @Column('json')
  config: any;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  version: string;

  @Column({ default: false })
  requiresAuthentication: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
