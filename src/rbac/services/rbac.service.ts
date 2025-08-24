import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class RbacService {
  private readonly logger = new Logger(RbacService.name);

  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Role) private readonly rolesRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permsRepo: Repository<Permission>,
  ) {}

  /**
   * Check if a user has a specific permission (including through role inheritance)
   */
  async hasPermission(
    userId: string,
    permissionName: string,
  ): Promise<boolean> {
    try {
      const user = await this.usersRepo.findOne({
        where: { id: userId },
        relations: ['roles'],
      });

      if (!user || !user.roles || user.roles.length === 0) {
        return false;
      }

      for (const role of user.roles) {
        const rolePermissions = await this.resolveRolePermissions(role.id);
        if (rolePermissions.some((p) => p.name === permissionName)) {
          return true;
        }
      }

      return false;
    } catch (error) {
      this.logger.error(
        `Error checking permission ${permissionName} for user ${userId}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Check if a user has any of the specified permissions
   */
  async hasAnyPermission(
    userId: string,
    permissionNames: string[],
  ): Promise<boolean> {
    for (const permissionName of permissionNames) {
      if (await this.hasPermission(userId, permissionName)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if a user has all of the specified permissions
   */
  async hasAllPermissions(
    userId: string,
    permissionNames: string[],
  ): Promise<boolean> {
    for (const permissionName of permissionNames) {
      if (!(await this.hasPermission(userId, permissionName))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if a user has a specific role
   */
  async hasRole(userId: string, roleName: string): Promise<boolean> {
    try {
      const user = await this.usersRepo.findOne({
        where: { id: userId },
        relations: ['roles'],
      });

      if (!user || !user.roles) {
        return false;
      }

      return user.roles.some((role) => role.name === roleName);
    } catch (error) {
      this.logger.error(
        `Error checking role ${roleName} for user ${userId}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Check if a user has any of the specified roles
   */
  async hasAnyRole(userId: string, roleNames: string[]): Promise<boolean> {
    try {
      const user = await this.usersRepo.findOne({
        where: { id: userId },
        relations: ['roles'],
      });

      if (!user || !user.roles) {
        return false;
      }

      return user.roles.some((role) => roleNames.includes(role.name));
    } catch (error) {
      this.logger.error(`Error checking roles for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get all effective permissions for a user (including through role inheritance)
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      const user = await this.usersRepo.findOne({
        where: { id: userId },
        relations: ['roles'],
      });

      if (!user || !user.roles || user.roles.length === 0) {
        return [];
      }

      const allPermissions = new Map<string, Permission>();

      for (const role of user.roles) {
        const rolePermissions = await this.resolveRolePermissions(role.id);
        rolePermissions.forEach((perm) => allPermissions.set(perm.id, perm));
      }

      return Array.from(allPermissions.values());
    } catch (error) {
      this.logger.error(`Error getting permissions for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get all roles for a user
   */
  async getUserRoles(userId: string): Promise<Role[]> {
    try {
      const user = await this.usersRepo.findOne({
        where: { id: userId },
        relations: ['roles'],
      });

      return user?.roles || [];
    } catch (error) {
      this.logger.error(`Error getting roles for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Resolve all permissions for a role (including inherited permissions)
   */
  private async resolveRolePermissions(roleId: string): Promise<Permission[]> {
    const role = await this.rolesRepo.findOne({
      where: { id: roleId },
      relations: ['permissions', 'parent'],
    });

    if (!role) {
      return [];
    }

    const visited = new Set<string>();
    const permissions = new Map<string, Permission>();
    const stack: (Role | null | undefined)[] = [role];

    while (stack.length) {
      const currentRole = stack.pop();
      if (!currentRole || visited.has(currentRole.id)) continue;

      visited.add(currentRole.id);

      // Add current role's permissions
      if (currentRole.permissions) {
        currentRole.permissions.forEach((perm) =>
          permissions.set(perm.id, perm),
        );
      }

      // Add parent role to stack for inheritance
      if (currentRole.parent) {
        stack.push(currentRole.parent);
      }
    }

    return Array.from(permissions.values());
  }
}
