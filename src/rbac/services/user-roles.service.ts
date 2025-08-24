import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';
import { Role } from '../entities/role.entity';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Role) private readonly rolesRepo: Repository<Role>,
  ) {}

  async assign(userId: string, roleId: string): Promise<User> {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException('User not found');
    // bail out if already assigned
    if ((user.roles ?? []).some((r) => r.id === roleId)) {
      return user;
    }
    const role = await this.rolesRepo.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');
    user.roles = [...(user.roles ?? []), role];
    return this.usersRepo.save(user);
  }

  async remove(userId: string, roleId: string) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException('User not found');
    user.roles = (user.roles ?? []).filter((r) => r.id !== roleId);
    return this.usersRepo.save(user);
  }
}
