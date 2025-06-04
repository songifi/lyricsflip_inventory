import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  category: string;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price: number;
}
