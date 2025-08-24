import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Setting } from './setting.entity';
import { User } from '../../users/user.entity';

export enum SettingChangeType {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  RESTORED = 'restored',
}

@Entity('setting_history')
export class SettingHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Setting, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'settingId' })
  setting: Setting;

  @Column({ type: 'uuid' })
  @Index()
  settingId: string;

  @Column({ type: 'varchar', length: 255 })
  settingKey: string;

  @Column({ type: 'text', nullable: true })
  oldValue: string;

  @Column({ type: 'text', nullable: true })
  newValue: string;

  @Column({
    type: 'enum',
    enum: SettingChangeType,
  })
  changeType: SettingChangeType;

  @Column({ type: 'varchar', length: 500, nullable: true })
  reason: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'changedBy' })
  changedByUser: User;

  @Column({ type: 'uuid', nullable: true })
  changedBy: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}