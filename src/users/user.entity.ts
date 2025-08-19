import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'text', nullable: true })
  refreshTokenHash: string | null;

  @BeforeInsert()
  normalizeEmail() {
    this.email = this.email.toLowerCase();
  }

  async setPassword(plain: string) {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(plain, salt);
  }

  async comparePassword(plain: string) {
    return bcrypt.compare(plain, this.passwordHash);
  }
}
