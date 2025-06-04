import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { AssignRoleDto } from '../dto/assign-role.dto';

@Injectable()
export class UserRoleService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async assignRoles(assignRoleDto: AssignRoleDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: assignRoleDto.userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roles = await this.roleRepository.findBy({
      id: In(assignRoleDto.roleIds),
    });

    user.roles = roles;
    return this.userRepository.save(user);
  }

  async removeRole(userId: number, roleId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.roles = user.roles.filter(role => role.id !== roleId);
    return this.userRepository.save(user);
  }

  async getUserRoles(userId: number): Promise<Role[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.roles;
  }
}