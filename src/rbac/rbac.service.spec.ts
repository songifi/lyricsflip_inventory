import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RbacService } from './services/rbac.service';
import { User } from '../users/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';

describe('RbacService', () => {
  let service: RbacService;
  let userRepo: Repository<User>;

  const mockUser: Partial<User> = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    roles: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RbacService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Role),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Permission),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RbacService>(RbacService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hasPermission', () => {
    it('should return false for user without roles', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser as User);

      const result = await service.hasPermission('user-1', 'users.manage');
      expect(result).toBe(false);
    });

    it('should return false for non-existent user', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);

      const result = await service.hasPermission(
        'non-existent',
        'users.manage',
      );
      expect(result).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return false for user without roles', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser as User);

      const result = await service.hasRole('user-1', 'admin');
      expect(result).toBe(false);
    });

    it('should return true for user with matching role', async () => {
      const userWithRole = {
        ...mockUser,
        roles: [{ id: 'role-1', name: 'admin' } as Role],
      };
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(userWithRole as User);

      const result = await service.hasRole('user-1', 'admin');
      expect(result).toBe(true);
    });
  });

  describe('getUserRoles', () => {
    it('should return empty array for user without roles', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser as User);

      const result = await service.getUserRoles('user-1');
      expect(result).toEqual([]);
    });

    it('should return user roles', async () => {
      const userWithRoles = {
        ...mockUser,
        roles: [{ id: 'role-1', name: 'admin' } as Role],
      };
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(userWithRoles as User);

      const result = await service.getUserRoles('user-1');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('admin');
    });
  });
});
