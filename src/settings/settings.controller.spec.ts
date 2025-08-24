import { TestingModule, Test } from "@nestjs/testing";
import { SettingsController } from "./controllers/settings.controller";
import { SettingType, SettingScope, SettingCategory } from "./entities/setting.entity";
import { SettingsService } from "./services/settings.service";

describe('SettingsController', () => {
  let controller: SettingsController;
  let service: SettingsService;

  const mockSettingsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByKey: jest.fn(),
    updateByKey: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getCategories: jest.fn(),
    createBackup: jest.fn(),
    restoreFromBackup: jest.fn(),
    getSettingHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [
        {
          provide: SettingsService,
          useValue: mockSettingsService,
        },
      ],
    }).compile();

    controller = module.get<SettingsController>(SettingsController);
    service = module.get<SettingsService>(SettingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a setting', async () => {
      const createDto = {
        key: 'test.setting',
        value: 'test value',
        type: SettingType.STRING,
        scope: SettingScope.SYSTEM,
        category: SettingCategory.GENERAL,
      };
      const expectedResult = { id: '1', ...createDto };
      const req = { user: { sub: 'user-id' } };

      mockSettingsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto, req);

      expect(service.create).toHaveBeenCalledWith(createDto, 'user-id');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all settings', async () => {
      const query = { scope: SettingScope.SYSTEM };
      const expectedResult = [
        { id: '1', key: 'setting1' },
        { id: '2', key: 'setting2' },
      ];

      mockSettingsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findByKey', () => {
    it('should return setting by key', async () => {
      const key = 'test.setting';
      const expectedResult = { id: '1', key };

      mockSettingsService.findByKey.mockResolvedValue(expectedResult);

      const result = await controller.findByKey(key);

      expect(service.findByKey).toHaveBeenCalledWith(key, undefined);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateByKey', () => {
    it('should update setting by key', async () => {
      const key = 'test.setting';
      const updateDto = { value: 'new value' };
      const req = { user: { sub: 'user-id' } };
      const expectedResult = { id: '1', key, value: 'new value' };

      mockSettingsService.updateByKey.mockResolvedValue(expectedResult);

      const result = await controller.updateByKey(key, updateDto, req);

      expect(service.updateByKey).toHaveBeenCalledWith(key, updateDto, 'user-id', undefined);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getCategories', () => {
    it('should return setting categories', async () => {
      const expectedResult = [
        { category: SettingCategory.GENERAL, count: 5 },
        { category: SettingCategory.SECURITY, count: 3 },
      ];

      mockSettingsService.getCategories.mockResolvedValue(expectedResult);

      const result = await controller.getCategories();

      expect(service.getCategories).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });
});