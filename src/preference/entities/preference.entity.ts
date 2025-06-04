import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Preference {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column('jsonb')
  preferences: Record<string, { email: boolean; sms: boolean; inApp: boolean }>;
}
