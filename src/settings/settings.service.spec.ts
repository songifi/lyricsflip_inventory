import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingsService } from './services/settings.service';
import {
  Setting,
  SettingScope,
  SettingType,
  SettingCategory,
} from './entities/setting.entity';
import { SettingHistory } from './entities/setting-history.entity';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

describe('SettingsService', () => {
  let service: SettingsService;
  let settingRepository: Repository<Setting>;
  let historyRepository: Repository<SettingHistory>;

  const mockSettingRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    })),
    remove: jest.fn(),
  };

  const mockHistoryRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: getRepositoryToken(Setting),
          useValue: mockSettingRepository,
        },
        {
          provide: getRepositoryToken(SettingHistory),
          useValue: mockHistoryRepository,
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    settingRepository = module.get<Repository<Setting>>(
      getRepositoryToken(Setting),
    );
    historyRepository = module.get<Repository<SettingHistory>>(
      getRepositoryToken(SettingHistory),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createSettingDto = {
      key: 'test.setting',
      value: 'test value',
      type: SettingType.STRING,
      scope: SettingScope.SYSTEM,
      category: SettingCategory.GENERAL,
    };

    it('should create a new setting successfully', async () => {
      const mockSetting = {
        id: '1',
        ...createSettingDto,
        setValue: jest.fn(),
        getParsedValue: jest.fn().mockReturnValue('test value'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSettingRepository.findOne.mockResolvedValue(null);
      mockSettingRepository.create.mockReturnValue(mockSetting);
      mockSettingRepository.save.mockResolvedValue(mockSetting);
      mockHistoryRepository.create.mockReturnValue({});
      mockHistoryRepository.save.mockResolvedValue({});

      const result = await service.create(createSettingDto, 'user-id');

      expect(mockSettingRepository.findOne).toHaveBeenCalledWith({
        where: {
          key: createSettingDto.key,
          scope: createSettingDto.scope,
          companyId: expect.any(Object),
        },
      });
      expect(mockSettingRepository.create).toHaveBeenCalledWith({
        ...createSettingDto,
        createdBy: 'user-id',
        updatedBy: 'user-id',
      });
      expect(mockSettingRepository.save).toHaveBeenCalledWith(mockSetting);
      expect(result.key).toBe(createSettingDto.key);
    });

    it('should throw ConflictException if setting already exists', async () => {
      const existingSetting = { id: '1', ...createSettingDto };
      mockSettingRepository.findOne.mockResolvedValue(existingSetting);

      await expect(service.create(createSettingDto, 'user-id')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException for company scope without companyId', async () => {
      const invalidDto = {
        ...createSettingDto,
        scope: SettingScope.COMPANY,
      };

      mockSettingRepository.findOne.mockResolvedValue(null);

      await expect(service.create(invalidDto, 'user-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByKey', () => {
    it('should find setting by key', async () => {
      const mockSetting = {
        id: '1',
        key: 'test.setting',
        value: 'test value',
        getParsedValue: jest.fn().mockReturnValue('test value'),
        type: SettingType.STRING,
        scope: SettingScope.SYSTEM,
        category: SettingCategory.GENERAL,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockSetting),
        getMany: jest.fn().mockResolvedValue([]),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      mockSettingRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findByKey('test.setting');

      expect(queryBuilder.where).toHaveBeenCalledWith('setting.key = :key', {
        key: 'test.setting',
      });
      expect(result.key).toBe('test.setting');
    });

    it('should throw NotFoundException if setting not found', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
        getMany: jest.fn().mockResolvedValue([]),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      mockSettingRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await expect(service.findByKey('nonexistent.setting')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateByKey', () => {
    const mockSetting = {
      id: '1',
      key: 'test.setting',
      value: 'old value',
      isReadonly: false,
      setValue: jest.fn(),
      getParsedValue: jest.fn().mockReturnValue('new value'),
      type: SettingType.STRING,
      validation: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update setting value successfully', async () => {
      const updateDto = { value: 'new value' };
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockSetting),
        getMany: jest.fn().mockResolvedValue([]),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      mockSettingRepository.createQueryBuilder.mockReturnValue(queryBuilder);
      mockSettingRepository.save.mockResolvedValue({
        ...mockSetting,
        value: 'new value',
      });
      mockHistoryRepository.create.mockReturnValue({});
      mockHistoryRepository.save.mockResolvedValue({});

      const result = await service.updateByKey(
        'test.setting',
        updateDto,
        'user-id',
      );

      expect(mockSetting.setValue).toHaveBeenCalledWith('new value');
      expect(mockSettingRepository.save).toHaveBeenCalled();
      expect(result.key).toBe('test.setting');
    });

    it('should throw ForbiddenException for readonly setting', async () => {
      const readonlySetting = { ...mockSetting, isReadonly: true };
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(readonlySetting),
        getMany: jest.fn().mockResolvedValue([]),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      mockSettingRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await expect(
        service.updateByKey('test.setting', { value: 'new value' }, 'user-id'),
      ).rejects.toThrow('This setting is read-only');
    });
  });

  describe('validation', () => {
    it('should validate number settings', async () => {
      const mockSetting = {
        type: SettingType.NUMBER,
        validation: { min: 10, max: 100, required: true },
      } as Setting;

      expect(() =>
        service['validateSettingValue'](mockSetting, '50'),
      ).not.toThrow();

      expect(() => service['validateSettingValue'](mockSetting, '5')).toThrow(
        BadRequestException,
      );

      expect(() => service['validateSettingValue'](mockSetting, '150')).toThrow(
        BadRequestException,
      );

      expect(() =>
        service['validateSettingValue'](mockSetting, 'not-a-number'),
      ).toThrow(BadRequestException);
    });

    it('should validate string settings', async () => {
      const mockSetting = {
        type: SettingType.STRING,
        validation: {
          minLength: 3,
          maxLength: 10,
          options: ['option1', 'option2'],
          pattern: '^[a-z0-9]+$',
        },
      } as Setting;

      expect(() =>
        service['validateSettingValue'](mockSetting, 'option1'),
      ).not.toThrow();

      expect(() => service['validateSettingValue'](mockSetting, 'ab')).toThrow(
        BadRequestException,
      );

      expect(() =>
        service['validateSettingValue'](mockSetting, 'verylongstring'),
      ).toThrow(BadRequestException);

      expect(() =>
        service['validateSettingValue'](mockSetting, 'option3'),
      ).toThrow(BadRequestException);

      expect(() =>
        service['validateSettingValue'](mockSetting, 'OPTION1'),
      ).toThrow(BadRequestException);
    });

    it('should validate boolean settings', async () => {
      const mockSetting = {
        type: SettingType.BOOLEAN,
        validation: {},
      } as Setting;

      expect(() =>
        service['validateSettingValue'](mockSetting, 'true'),
      ).not.toThrow();
      expect(() =>
        service['validateSettingValue'](mockSetting, 'false'),
      ).not.toThrow();

      expect(() =>
        service['validateSettingValue'](mockSetting, 'maybe'),
      ).toThrow(BadRequestException);
    });

    it('should validate JSON settings', async () => {
      const mockSetting = {
        type: SettingType.JSON,
        validation: {},
      } as Setting;

      expect(() =>
        service['validateSettingValue'](mockSetting, '{"key": "value"}'),
      ).not.toThrow();

      expect(() =>
        service['validateSettingValue'](mockSetting, '{invalid json}'),
      ).toThrow(BadRequestException);
    });

    it('should validate required settings', async () => {
      const mockSetting = {
        type: SettingType.STRING,
        validation: { required: true },
      } as Setting;

      expect(() => service['validateSettingValue'](mockSetting, '')).toThrow(
        BadRequestException,
      );
      expect(() => service['validateSettingValue'](mockSetting, null)).toThrow(
        BadRequestException,
      );
      expect(() =>
        service['validateSettingValue'](mockSetting, undefined),
      ).toThrow(BadRequestException);
    });
  });

  describe('backup and restore', () => {
    it('should create backup successfully', async () => {
      const mockSettings = [
        {
          id: '1',
          key: 'test.setting1',
          value: 'value1',
          getParsedValue: () => 'value1',
          type: SettingType.STRING,
          scope: SettingScope.SYSTEM,
          category: SettingCategory.GENERAL,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          key: 'test.setting2',
          value: 'value2',
          getParsedValue: () => 'value2',
          type: SettingType.STRING,
          scope: SettingScope.SYSTEM,
          category: SettingCategory.GENERAL,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
        getMany: jest.fn().mockResolvedValue(mockSettings),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      mockSettingRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.createBackup(
        SettingScope.SYSTEM,
        undefined,
        'Test backup',
      );

      expect(result.settings).toHaveLength(2);
      expect(result.version).toBe('1.0.0');
      expect(result.description).toBe('Test backup');
    });

    it('should restore from backup successfully', async () => {
      const backupData = {
        settings: [
          {
            key: 'new.setting',
            value: 'new value',
            type: SettingType.STRING,
            scope: SettingScope.SYSTEM,
            category: SettingCategory.GENERAL,
          },
        ],
        reason: 'Test restore',
      };

      mockSettingRepository.findOne.mockResolvedValue(null);
      const mockNewSetting = {
        id: '1',
        ...backupData.settings[0],
        setValue: jest.fn(),
        // setParsedValue: jest.fn(),
        getParsedValue: jest.fn().mockReturnValue('new value'),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-id',
        updatedBy: 'user-id',
      };
      mockSettingRepository.create.mockReturnValue(mockNewSetting);
      mockSettingRepository.save.mockResolvedValue(mockNewSetting);
      mockHistoryRepository.create.mockReturnValue({});
      mockHistoryRepository.save.mockResolvedValue({});

      const result = await service.restoreFromBackup(backupData, 'user-id');

      expect(result.created).toBe(1);
      expect(result.updated).toBe(0);
      expect(result.errors).toHaveLength(0);
    });
  });
});
