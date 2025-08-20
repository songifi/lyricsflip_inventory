import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(

    private readonly auditLogService: AuditLogService,
    // Other dependencies...
  ) {}

  async updateUser(id: string, updateData: any, currentUser: any): Promise<any> {
    const oldUser = await this.findById(id);
    
    // Perform the update
    const updatedUser = await this.update(id, updateData);

    // Manual audit logging for complex operations
    await this.auditLogService.logActivity(
      currentUser.id,
      AuditAction.UPDATE,
      'User',
      id,
      oldUser,
      updatedUser,
      { reason: 'User profile update' }
    );

    return updatedUser;
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
