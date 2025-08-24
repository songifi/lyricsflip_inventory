import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';

@Injectable()
export class RbacSeeder implements OnModuleInit {
  private readonly logger = new Logger(RbacSeeder.name);

  constructor(
    @InjectRepository(Role) private readonly rolesRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permsRepo: Repository<Permission>,
  ) {}

  async onModuleInit() {
    await this.seedDefaults();
  }

  private async ensurePermission(name: string, description?: string) {
    let perm = await this.permsRepo.findOne({ where: { name } });
    if (!perm) {
      perm = this.permsRepo.create({ name, description });
      perm = await this.permsRepo.save(perm);
      this.logger.log(`Created permission: ${name}`);
    }
    return perm;
  }

  private async ensureRole(
    name: string,
    description?: string,
    parent?: Role | null,
  ) {
    let role = await this.rolesRepo.findOne({
      where: { name },
      relations: ['permissions', 'parent'],
    });
    if (!role) {
      role = this.rolesRepo.create({
        name,
        description,
        parent: parent ?? undefined,
      });
      role = await this.rolesRepo.save(role);
      this.logger.log(`Created role: ${name}`);
    }
    return role;
  }

  private async seedDefaults() {
    const manageUsers = await this.ensurePermission(
      'users.manage',
      'Create/update/delete users',
    );
    const viewAudit = await this.ensurePermission(
      'audit.view',
      'View audit logs',
    );
    const manageInventory = await this.ensurePermission(
      'inventory.manage',
      'Manage inventory items',
    );

    const viewRoles = await this.ensurePermission(
      'roles.view',
      'View roles and their permissions',
    );
    const createRoles = await this.ensurePermission(
      'roles.create',
      'Create new roles',
    );
    const updateRoles = await this.ensurePermission(
      'roles.update',
      'Update existing roles',
    );
    const deleteRoles = await this.ensurePermission(
      'roles.delete',
      'Delete roles',
    );
    const manageRolePermissions = await this.ensurePermission(
      'roles.manage_permissions',
      'Manage role permissions',
    );
    const viewPermissions = await this.ensurePermission(
      'permissions.view',
      'View available permissions',
    );
    const createPermissions = await this.ensurePermission(
      'permissions.create',
      'Create new permissions',
    );
    const deletePermissions = await this.ensurePermission(
      'permissions.delete',
      'Delete permissions',
    );

    const admin = await this.ensureRole('admin', 'System administrator');
    const manager = await this.ensureRole('manager', 'Manager role');
    const user = await this.ensureRole('user', 'Regular user');

    // set hierarchy: manager -> user
    if (!manager.parent) {
      manager.parent = user;
      await this.rolesRepo.save(manager);
    }

    // assign permissions
    await this.addPermissionsIfMissing(admin, [
      manageUsers.id,
      viewAudit.id,
      manageInventory.id,
      viewRoles.id,
      createRoles.id,
      updateRoles.id,
      deleteRoles.id,
      manageRolePermissions.id,
      viewPermissions.id,
      createPermissions.id,
      deletePermissions.id,
    ]);

    await this.addPermissionsIfMissing(manager, [manageInventory.id]);

    await this.addPermissionsIfMissing(user, []);
  }

  private async addPermissionsIfMissing(
    role: Role,
    desiredPermissionIds: string[],
  ) {
    const relation = this.rolesRepo
      .createQueryBuilder()
      .relation(Role, 'permissions')
      .of(role.id);

    const existingPermissions: Permission[] = await relation.loadMany();
    const existingIds = new Set(existingPermissions.map((p) => p.id));
    const toAdd = desiredPermissionIds.filter((id) => !existingIds.has(id));

    if (toAdd.length > 0) {
      await relation.add(toAdd);
      this.logger.log(
        `Updated role "${role.name}": added ${toAdd.length} permission(s)`,
      );
    }
  }
}
