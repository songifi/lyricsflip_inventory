import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('hospital_configurations')
export class HospitalConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  hospitalId: string;

  @Column()
  name: string;

  @Column('json')
  departments: any[];

  @Column('json')
  equipment: any[];

  @Column('json')
  policies: any[];

  @Column('json')
  alerts: any[];

  @Column('json')
  insuranceProviders: any[];

  @Column('json')
  emergencyProtocols: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
