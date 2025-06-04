import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertThresholdService } from './alert-threshold.service';
import { AlertThreshold } from './entities/alert-threshold.entity';
import { CreateAlertThresholdDto, UpdateAlertThresholdDto } from './dto/alert-threshold.dto';

describe('AlertThresholdService', () => {
  let service: AlertThresholdService;
  let repository: Repository<AlertThreshold>;

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
        AlertThresholdService,
        {
          provide: getRepositoryToken(AlertThreshold),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AlertThresholdService>(AlertThresholdService);
    repository = module.get<Repository<AlertThreshold>>(getRepositoryToken(AlertThreshold));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of alert thresholds', async () => {
      const result = [new AlertThreshold()];
      jest.spyOn(repository, 'find').mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an alert threshold by id', async () => {
      const result = new AlertThreshold();
      jest.spyOn(repository, 'findOne').mockResolvedValue(result);

      expect(await service.findOne(1)).toBe(result);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('findByCategory', () => {
    it('should return alert thresholds by category', async () => {
      const result = [new AlertThreshold()];
      jest.spyOn(repository, 'find').mockResolvedValue(result);

      expect(await service.findByCategory('inventory')).toBe(result);
      expect(repository.find).toHaveBeenCalledWith({ where: { category: 'inventory' } });
    });
  });

  describe('findBySeverity', () => {
    it('should return alert thresholds by severity', async () => {
      const result = [new AlertThreshold()];
      jest.spyOn(repository, 'find').mockResolvedValue(result);

      expect(await service.findBySeverity('high')).toBe(result);
      expect(repository.find).toHaveBeenCalledWith({ where: { severity: 'high' } });
    });
  });

  describe('create', () => {
    it('should create a new alert threshold', async () => {
      const dto: CreateAlertThresholdDto = {
        name: 'Low Stock Alert',
        description: 'Alert when stock is low',
        category: 'inventory',
        severity: 'medium',
        thresholdValue: 10,
        operator: 'lt',
        unit: 'count',
        notificationConfig: {
          email: true,
          sms: false,
          pushNotification: true,
          recipients: ['admin@example.com']
        },
        isActive: true
      };
      const threshold = new AlertThreshold();
      Object.assign(threshold, dto);

      jest.spyOn(repository, 'create').mockReturnValue(threshold);
      jest.spyOn(repository, 'save').mockResolvedValue(threshold);

      expect(await service.create(dto)).toBe(threshold);
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(threshold);
    });
  });

  describe('update', () => {
    it('should update an alert threshold', async () => {
      const id = 1;
      const dto: UpdateAlertThresholdDto = {
        thresholdValue: 15,
        description: 'Updated description'
      };
      const threshold = new AlertThreshold();
      threshold.id = id;
      Object.assign(threshold, dto);

      jest.spyOn(repository, 'findOne').mockResolvedValue(threshold);
      jest.spyOn(repository, 'save').mockResolvedValue(threshold);

      expect(await service.update(id, dto)).toBe(threshold);
      expect(repository.save).toHaveBeenCalledWith(threshold);
    });
  });

  describe('toggleActive', () => {
    it('should toggle the active status of an alert threshold', async () => {
      const id = 1;
      const threshold = new AlertThreshold();
      threshold.id = id;
      threshold.isActive = true;

      const updatedThreshold = new AlertThreshold();
      updatedThreshold.id = id;
      updatedThreshold.isActive = false;

      jest.spyOn(repository, 'findOne').mockResolvedValue(threshold);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedThreshold);

      expect(await service.toggleActive(id)).toBe(updatedThreshold);
      expect(repository.save).toHaveBeenCalledWith({ ...threshold, isActive: false });
    });
  });

  describe('remove', () => {
    it('should delete an alert threshold', async () => {
      const id = 1;
      const result = { affected: 1 };
      jest.spyOn(repository, 'delete').mockResolvedValue(result as any);

      expect(await service.remove(id)).toBe(result);
      expect(repository.delete).toHaveBeenCalledWith(id);
    });
  });
});
