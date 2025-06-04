import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  // Role CRUD operations
  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const { permissionIds, ...roleData } = createRoleDto;

    // Check if role name already exists
    const existingRole = await this.roleRepository.findOne({
      where: { name: roleData.name }
    });

    if (existingRole) {
      throw new ConflictException('Role name already exists');
    }

    // Get permissions if provided
    let permissions: Permission[] = [];
    if (permissionIds && permissionIds.length > 0) {
      permissions = await this.permissionRepository.findBy({ id: In(permissionIds) });
      if (permissions.length !== permissionIds.length) {
        throw new BadRequestException('One or more permission IDs are invalid');
      }
    }

    const role = this.roleRepository.create({
      ...roleData,
      permissions,
    });

    return this.roleRepository.save(role);
  }

  async findAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['permissions', 'users'],
    });
  }

  async findOneRole(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions', 'users'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOneRole(id);
    const { permissionIds, ...updateData } = updateRoleDto;

    // Check for name conflicts
    if (updateData.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateData.name }
      });

      if (existingRole && existingRole.id !== id) {
        throw new ConflictException('Role name already exists');
      }
    }

    // Update permissions if provided
    if (permissionIds !== undefined) {
      if (permissionIds.length > 0) {
        const permissions = await this.permissionRepository.findBy({ id: In(permissionIds) });
        if (permissions.length !== permissionIds.length) {
          throw new BadRequestException('One or more permission IDs are invalid');
        }
        role.permissions = permissions;
      } else {
        role.permissions = [];
      }
    }

    Object.assign(role, updateData);
    return this.roleRepository.save(role);
  }

  async removeRole(id: string): Promise<void> {
    const role = await this.findOneRole(id);
    await this.roleRepository.remove(role);
  }

  // Permission CRUD operations
  async createPermission(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    // Check if permission name already exists
    const existingPermission = await this.permissionRepository.findOne({
      where: { name: createPermissionDto.name }
    });

    if (existingPermission) {
      throw new ConflictException('Permission name already exists');
    }

    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  async findAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find({
      relations: ['roles'],
    });
  }

  async findOnePermission(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return permission;
  }

  async updatePermission(id: string, updatePermissionDto: Partial<CreatePermissionDto>): Promise<Permission> {
    const permission = await this.findOnePermission(id);

    // Check for name conflicts
    if (updatePermissionDto.name) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { name: updatePermissionDto.name }
      });

      if (existingPermission && existingPermission.id !== id) {
        throw new ConflictException('Permission name already exists');
      }
    }

    Object.assign(permission, updatePermissionDto);
    return this.permissionRepository.save(permission);
  }

  async removePermission(id: string): Promise<void> {
    const permission = await this.findOnePermission(id);
    await this.permissionRepository.remove(permission);
  }

  // Helper methods
  async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<Role> {
    const role = await this.findOneRole(roleId);
    const permissions = await this.permissionRepository.findBy({ id: In(permissionIds) });

    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('One or more permission IDs are invalid');
    }

    role.permissions = permissions;
    return this.roleRepository.save(role);
  }

  async removePermissionsFromRole(roleId: string, permissionIds: string[]): Promise<Role> {
    const role = await this.findOneRole(roleId);
    
    role.permissions = role.permissions.filter(
      permission => !permissionIds.includes(permission.id)
    );
    
    return this.roleRepository.save(role);
  }
} 