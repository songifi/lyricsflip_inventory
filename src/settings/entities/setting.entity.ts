import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';

export enum SettingScope {
  SYSTEM = 'system',
  COMPANY = 'company',
}

export enum SettingType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
  ARRAY = 'array',
}

export enum SettingCategory {
  GENERAL = 'general',
  SECURITY = 'security',
  NOTIFICATIONS = 'notifications',
  INVENTORY = 'inventory',
  REPORTING = 'reporting',
  INTEGRATIONS = 'integrations',
  APPEARANCE = 'appearance',
  SYSTEM = 'system',
}

@Entity('settings')
@Index(['key', 'scope', 'companyId'], { unique: true })
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  key: string;

  @Column({ type: 'text', nullable: true })
  value: string;

  @Column({
    type: 'enum',
    enum: SettingType,
    default: SettingType.STRING,
  })
  type: SettingType;

  @Column({
    type: 'enum',
    enum: SettingScope,
    default: SettingScope.SYSTEM,
  })
  @Index()
  scope: SettingScope;

  @Column({
    type: 'enum',
    enum: SettingCategory,
    default: SettingCategory.GENERAL,
  })
  @Index()
  category: SettingCategory;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  companyId: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  validation: {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    options?: string[];
  };

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isReadonly: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  defaultValue: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  createdByUser: User;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updatedBy' })
  updatedByUser: User;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  Id: string | undefined;

  // Helper methods
  getParsedValue(): any {
    if (!this.value) return this.getDefaultValue();

    try {
      switch (this.type) {
        case SettingType.BOOLEAN:
          return this.value.toLowerCase() === 'true';
        case SettingType.NUMBER:
          return parseFloat(this.value);
        case SettingType.JSON:
        case SettingType.ARRAY:
          return JSON.parse(this.value);
        default:
          return this.value;
      }
    } catch {
      return this.getDefaultValue();
    }
  }

  getDefaultValue(): any {
    if (!this.defaultValue) return null;

    try {
      switch (this.type) {
        case SettingType.BOOLEAN:
          return this.defaultValue.toLowerCase() === 'true';
        case SettingType.NUMBER:
          return parseFloat(this.defaultValue);
        case SettingType.JSON:
        case SettingType.ARRAY:
          return JSON.parse(this.defaultValue);
        default:
          return this.defaultValue;
      }
    } catch {
      return null;
    }
  }

  setValue(value: any): void {
    switch (this.type) {
      case SettingType.BOOLEAN:
        this.value = value ? 'true' : 'false';
        break;
      case SettingType.NUMBER:
        this.value = value?.toString();
        break;
      case SettingType.JSON:
      case SettingType.ARRAY:
        this.value = JSON.stringify(value);
        break;
      default:
        this.value = value?.toString();
    }
  }
}