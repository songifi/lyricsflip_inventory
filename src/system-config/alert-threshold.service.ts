import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertThreshold, AlertCategory, AlertSeverity } from './entities/alert-threshold.entity';
import { CreateAlertThresholdDto, UpdateAlertThresholdDto } from './dto/alert-threshold.dto';

@Injectable()
export class AlertThresholdService {
  constructor(
    @InjectRepository(AlertThreshold)
    private readonly alertThresholdRepository: Repository<AlertThreshold>,
  ) {}

  async create(createAlertThresholdDto: CreateAlertThresholdDto): Promise<AlertThreshold> {
    const alertThreshold = this.alertThresholdRepository.create(createAlertThresholdDto);
    return await this.alertThresholdRepository.save(alertThreshold);
  }

  async findAll(category?: AlertCategory, severity?: AlertSeverity): Promise<AlertThreshold[]> {
    const query = this.alertThresholdRepository.createQueryBuilder('alertThreshold');
    
    if (category) {
      query.andWhere('alertThreshold.category = :category', { category });
    }
    
    if (severity) {
      query.andWhere('alertThreshold.severity = :severity', { severity });
    }
    
    return await query.getMany();
  }

  async findActive(): Promise<AlertThreshold[]> {
    return await this.alertThresholdRepository.find({
      where: { isActive: true }
    });
  }

  async findOne(id: string): Promise<AlertThreshold> {
    const alertThreshold = await this.alertThresholdRepository.findOne({
      where: { id }
    });

    if (!alertThreshold) {
      throw new NotFoundException(`Alert threshold with ID '${id}' not found`);
    }

    return alertThreshold;
  }

  async update(id: string, updateAlertThresholdDto: UpdateAlertThresholdDto): Promise<AlertThreshold> {
    const alertThreshold = await this.findOne(id);
    
    Object.assign(alertThreshold, updateAlertThresholdDto);
    return await this.alertThresholdRepository.save(alertThreshold);
  }

  async remove(id: string): Promise<void> {
    const alertThreshold = await this.findOne(id);
    await this.alertThresholdRepository.remove(alertThreshold);
  }

  async toggleActive(id: string, isActive: boolean): Promise<AlertThreshold> {
    const alertThreshold = await this.findOne(id);
    
    alertThreshold.isActive = isActive;
    return await this.alertThresholdRepository.save(alertThreshold);
  }

  async findByCategoryAndSeverity(category: AlertCategory, severity: AlertSeverity): Promise<AlertThreshold[]> {
    return await this.alertThresholdRepository.find({
      where: {
        category,
        severity,
        isActive: true
      }
    });
  }

  async bulkCreate(thresholds: CreateAlertThresholdDto[]): Promise<AlertThreshold[]> {
    const results: AlertThreshold[] = [];
    
    for (const thresholdDto of thresholds) {
      const threshold = await this.create(thresholdDto);
      results.push(threshold);
    }
    
    return results;
  }
}
