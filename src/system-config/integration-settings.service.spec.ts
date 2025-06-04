import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntegrationSettingsService } from './integration-settings.service';
import { IntegrationSettings } from './entities/integration-settings.entity';
import { CreateIntegrationSettingDto, UpdateIntegrationSettingDto } from './dto/integration-settings.dto';

describe('IntegrationSettingsService', () => {
  let service: IntegrationSettingsService;
  let repository: Repository<IntegrationSettings>;

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
        IntegrationSettingsService,
        {
          provide: getRepositoryToken(IntegrationSettings),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<IntegrationSettingsService>(IntegrationSettingsService);
    repository = module.get<Repository<IntegrationSettings>>(getRepositoryToken(IntegrationSettings));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of integration settings', async () => {
      const result = [new IntegrationSettings()];
      jest.spyOn(repository, 'find').mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an integration setting by id', async () => {
      const result = new IntegrationSettings();
      jest.spyOn(repository, 'findOne').mockResolvedValue(result);

      expect(await service.findOne(1)).toBe(result);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('findByKey', () => {
    it('should return an integration setting by key', async () => {
      const result = new IntegrationSettings();
      jest.spyOn(repository, 'findOne').mockResolvedValue(result);

      expect(await service.findByKey('api-key')).toBe(result);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { key: 'api-key' } });
    });
  });

  describe('create', () => {
    it('should create a new integration setting', async () => {
      const dto: CreateIntegrationSettingDto = {
        name: 'Payment Gateway',
        key: 'payment-gateway',
        type: 'api',
        config: { url: 'https://api.example.com', timeout: 30 },
        isActive: true,
        description: 'Payment gateway integration',
        version: '1.0',
        requiresAuthentication: true
      };
      const setting = new IntegrationSettings();
      Object.assign(setting, dto);

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(setting);
      jest.spyOn(repository, 'save').mockResolvedValue(setting);

      expect(await service.create(dto)).toBe(setting);
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(setting);
    });

    it('should throw an error if key already exists', async () => {
      const dto: CreateIntegrationSettingDto = {
        name: 'Payment Gateway',
        key: 'payment-gateway',
        type: 'api',
        config: { url: 'https://api.example.com', timeout: 30 },
        isActive: true,
        description: 'Payment gateway integration',
        version: '1.0',
        requiresAuthentication: true
      };
      const existingSetting = new IntegrationSettings();

      jest.spyOn(repository, 'findOne').mockResolvedValue(existingSetting);

      await expect(service.create(dto)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update an integration setting', async () => {
      const id = 1;
      const dto: UpdateIntegrationSettingDto = {
        config: { url: 'https://api-updated.example.com', timeout: 60 },
        description: 'Updated description'
      };
      const setting = new IntegrationSettings();
      setting.id = id;
      Object.assign(setting, dto);

      jest.spyOn(repository, 'findOne').mockResolvedValue(setting);
      jest.spyOn(repository, 'save').mockResolvedValue(setting);

      expect(await service.update(id, dto)).toBe(setting);
      expect(repository.save).toHaveBeenCalledWith(setting);
    });
  });

  describe('updateConfig', () => {
    it('should update only the config of an integration setting', async () => {
      const id = 1;
      const config = { url: 'https://api-updated.example.com', timeout: 60 };
      const setting = new IntegrationSettings();
      setting.id = id;
      setting.config = { url: 'https://api.example.com', timeout: 30 };

      const updatedSetting = new IntegrationSettings();
      updatedSetting.id = id;
      updatedSetting.config = config;

      jest.spyOn(repository, 'findOne').mockResolvedValue(setting);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedSetting);

      expect(await service.updateConfig(id, config)).toBe(updatedSetting);
      expect(repository.save).toHaveBeenCalledWith({ ...setting, config });
    });
  });

  describe('toggleActive', () => {
    it('should toggle the active status of an integration setting', async () => {
      const id = 1;
      const setting = new IntegrationSettings();
      setting.id = id;
      setting.isActive = true;

      const updatedSetting = new IntegrationSettings();
      updatedSetting.id = id;
      updatedSetting.isActive = false;

      jest.spyOn(repository, 'findOne').mockResolvedValue(setting);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedSetting);

      expect(await service.toggleActive(id)).toBe(updatedSetting);
      expect(repository.save).toHaveBeenCalledWith({ ...setting, isActive: false });
    });
  });

  describe('remove', () => {
    it('should delete an integration setting', async () => {
      const id = 1;
      const result = { affected: 1 };
      jest.spyOn(repository, 'delete').mockResolvedValue(result as any);

      expect(await service.remove(id)).toBe(result);
      expect(repository.delete).toHaveBeenCalledWith(id);
    });
  });
});
