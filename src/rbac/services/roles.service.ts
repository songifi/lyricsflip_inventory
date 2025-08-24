import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly rolesRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permsRepo: Repository<Permission>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.rolesRepo.find({ relations: ['permissions', 'parent'] });
  }

  async create(
    name: string,
    description?: string,
    parentId?: string,
  ): Promise<Role> {
    const existing = await this.rolesRepo.findOne({ where: { name } });
    if (existing) throw new BadRequestException('Role already exists');
    let parent: Role | null = null;
    if (parentId) {
      parent = await this.rolesRepo.findOne({ where: { id: parentId } });
      if (!parent) throw new NotFoundException('Parent role not found');
    }
    const role = this.rolesRepo.create({
      name,
      description,
      parent: parent ?? undefined,
    });
    return this.rolesRepo.save(role);
  }

  async update(
    id: string,
    payload: Partial<Pick<Role, 'name' | 'description'>> & {
      parentId?: string | null;
    },
  ): Promise<Role> {
    const role = await this.rolesRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    if (payload.name) role.name = payload.name;
    if (payload.description !== undefined)
      role.description = payload.description;
    if (payload.parentId !== undefined) {
      if (payload.parentId === null) role.parent = null;
      else {
        const parent = await this.rolesRepo.findOne({
          where: { id: payload.parentId },
        });
        if (!parent) throw new NotFoundException('Parent role not found');
        role.parent = parent;
      }
    }
    return this.rolesRepo.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.rolesRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    await this.rolesRepo.delete(role.id);
  }

  async findByName(name: string): Promise<Role | null> {
    return this.rolesRepo.findOne({ where: { name } });
  }

  async findByIds(ids: string[]): Promise<Role[]> {
    if (ids.length === 0) return [];
    return this.rolesRepo.findBy({ id: In(ids) });
  }

  async addPermission(
    roleId: string,
    permNameOrId: { id?: string; name?: string },
  ): Promise<Role> {
    const role = await this.rolesRepo.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });
    if (!role) throw new NotFoundException('Role not found');
    let permission: Permission | null = null;
    if (permNameOrId.id) {
      permission = await this.permsRepo.findOne({
        where: { id: permNameOrId.id },
      });
    } else if (permNameOrId.name) {
      permission = await this.permsRepo.findOne({
        where: { name: permNameOrId.name },
      });
    }
    if (!permission) throw new NotFoundException('Permission not found');
    role.permissions = Array.from(
      new Set([...(role.permissions ?? []), permission]),
    );
    return this.rolesRepo.save(role);
  }

  async removePermission(roleId: string, permId: string): Promise<void> {
    const role = await this.rolesRepo.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });
    if (!role) throw new NotFoundException('Role not found');
    role.permissions = (role.permissions ?? []).filter((p) => p.id !== permId);
    await this.rolesRepo.save(role);
  }

  async resolveAllPermissions(roleId: string): Promise<Permission[]> {
    const role = await this.rolesRepo.findOne({
      where: { id: roleId },
      relations: ['permissions', 'parent'],
    });
    if (!role) throw new NotFoundException('Role not found');
    const visited = new Set<string>();
    const perms = new Map<string, Permission>();
    const stack: (Role | null | undefined)[] = [role];
    while (stack.length) {
      const r = stack.pop();
      if (!r || visited.has(r.id)) continue;
      visited.add(r.id);
      const withPerms = await this.rolesRepo.findOne({
        where: { id: r.id },
        relations: ['permissions', 'parent'],
      });
      (withPerms?.permissions ?? []).forEach((p) => perms.set(p.id, p));
      if (withPerms?.parent) stack.push(withPerms.parent);
    }
    return Array.from(perms.values());
  }
}
