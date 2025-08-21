import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, In } from 'typeorm';
import { Permission } from '../entities/permission.entity';

type QueryErrorWithDriverCode = { driverError?: { code?: unknown } };

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permsRepo: Repository<Permission>,
  ) {}

  async findAll(): Promise<Permission[]> {
    return this.permsRepo.find();
  }

  async create(name: string, description?: string): Promise<Permission> {
    const normalized = name?.trim();
    if (!normalized) {
      throw new BadRequestException('Permission name is required');
    }
    const perm = this.permsRepo.create({ name: normalized, description });
    try {
      return await this.permsRepo.save(perm);
    } catch (err: unknown) {
      let code: string | undefined;
      if (err instanceof QueryFailedError) {
        const driverError = (err as QueryErrorWithDriverCode).driverError;
        if (typeof driverError?.code === 'string') {
          code = driverError.code;
        }
      } else if (err && typeof err === 'object') {
        const errorWithCode = err as { code?: unknown };
        if (typeof errorWithCode.code === 'string') {
          code = errorWithCode.code;
        }
      }
      if (
        code === '23505' ||
        code === 'ER_DUP_ENTRY' ||
        code === 'SQLITE_CONSTRAINT' ||
        code === 'SQLITE_CONSTRAINT_UNIQUE'
      ) {
        throw new BadRequestException('Permission already exists');
      }
      throw err;
    }
  }

  async remove(id: string): Promise<void> {
    const existing = await this.permsRepo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('Permission not found');
    await this.permsRepo.delete(id);
  }

  async findByName(name: string): Promise<Permission | null> {
    return this.permsRepo.findOne({ where: { name } });
  }

  async findByIds(ids: string[]): Promise<Permission[]> {
    if (ids.length === 0) return [];
    return this.permsRepo.findBy({ id: In(ids) });
  }
}
