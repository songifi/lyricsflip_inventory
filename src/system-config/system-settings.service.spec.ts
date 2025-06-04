import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSettingsService } from './system-settings.service';
import { SystemSettings } from './entities/system-settings.entity';
import { CreateSystemSettingDto, UpdateSystemSettingDto } from './dto/system-settings.dto';

describe('SystemSettingsService', () => {
  let service: SystemSettingsService;
  let repository: Repository<SystemSettings>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemSettingsService,
        {
          provide: getRepositoryToken(SystemSettings),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SystemSettingsService>(SystemSettingsService);
    repository = module.get<Repository<SystemSettings>>(getRepositoryToken(SystemSettings));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of system settings', async () => {
      const result = [new SystemSettings()];
      jest.spyOn(repository, 'find').mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a system setting by id', async () => {
      const result = new SystemSettings();
      jest.spyOn(repository, 'findOne').mockResolvedValue(result);

      expect(await service.findOne(1)).toBe(result);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('findByKey', () => {
    it('should return a system setting by key', async () => {
      const result = new SystemSettings();
      jest.spyOn(repository, 'findOne').mockResolvedValue(result);

      expect(await service.findByKey('test-key')).toBe(result);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { key: 'test-key' } });
    });
  });

  describe('create', () => {
    it('should create a new system setting', async () => {
      const dto: CreateSystemSettingDto = {
        key: 'test-key',
        value: 'test-value',
        description: 'test description',
        type: 'string',
        isSecret: false,
        isEditable: true,
        category: 'general',
      };
      const setting = new SystemSettings();
      Object.assign(setting, dto);

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(setting);
      jest.spyOn(repository, 'save').mockResolvedValue(setting);

      expect(await service.create(dto)).toBe(setting);
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(setting);
    });

    it('should throw an error if key already exists', async () => {
      const dto: CreateSystemSettingDto = {
        key: 'test-key',
        value: 'test-value',
        description: 'test description',
        type: 'string',
        isSecret: false,
        isEditable: true,
        category: 'general',
      };
      const existingSetting = new SystemSettings();

      jest.spyOn(repository, 'findOne').mockResolvedValue(existingSetting);

      await expect(service.create(dto)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a system setting', async () => {
      const id = 1;
      const dto: UpdateSystemSettingDto = {
        value: 'updated-value',
        description: 'updated description',
      };
      const setting = new SystemSettings();
      setting.id = id;
      setting.isEditable = true;
      Object.assign(setting, dto);

      jest.spyOn(repository, 'findOne').mockResolvedValue(setting);
      jest.spyOn(repository, 'save').mockResolvedValue(setting);

      expect(await service.update(id, dto)).toBe(setting);
      expect(repository.save).toHaveBeenCalledWith(setting);
    });

    it('should throw an error if setting is not editable', async () => {
      const id = 1;
      const dto: UpdateSystemSettingDto = {
        value: 'updated-value',
      };
      const setting = new SystemSettings();
      setting.id = id;
      setting.isEditable = false;

      jest.spyOn(repository, 'findOne').mockResolvedValue(setting);

      await expect(service.update(id, dto)).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should delete a system setting', async () => {
      const id = 1;
      const result = { affected: 1 };
      jest.spyOn(repository, 'delete').mockResolvedValue(result as any);

      expect(await service.remove(id)).toBe(result);
      expect(repository.delete).toHaveBeenCalledWith(id);
    });
  });
});
