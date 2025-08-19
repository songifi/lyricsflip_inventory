import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email: email.toLowerCase() } });
  }

  async findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async createUser(params: { email: string; name: string; password: string }) {
    const existing = await this.findByEmail(params.email);
    if (existing) throw new Error('Email already in use');

    const user = this.repo.create({
      email: params.email,
      name: params.name,
      passwordHash: '',
    });
    await user.setPassword(params.password);
    return this.repo.save(user);
  }

  async updateRefreshToken(userId: string, refreshToken: string | null) {
    const user = await this.findById(userId);
    if (!user) return null;
    if (refreshToken) {
      const salt = await bcrypt.genSalt(12);
      user.refreshTokenHash = await bcrypt.hash(refreshToken, salt);
    } else {
      user.refreshTokenHash = null;
    }
    await this.repo.save(user);
    return user;
  }

  async compareRefreshToken(userId: string, refreshToken: string) {
    const user = await this.findById(userId);
    if (!user || !user.refreshTokenHash) return false;
    return bcrypt.compare(refreshToken, user.refreshTokenHash);
  }
}
