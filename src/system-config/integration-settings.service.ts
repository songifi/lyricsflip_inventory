import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntegrationSettings, IntegrationType } from './entities/integration-settings.entity';
import { CreateIntegrationSettingsDto, UpdateIntegrationSettingsDto } from './dto/integration-settings.dto';

@Injectable()
export class IntegrationSettingsService {
  constructor(
    @InjectRepository(IntegrationSettings)
    private readonly integrationRepository: Repository<IntegrationSettings>,
  ) {}

  async create(createIntegrationDto: CreateIntegrationSettingsDto): Promise<IntegrationSettings> {
    const existingIntegration = await this.integrationRepository.findOne({
      where: { key: createIntegrationDto.key }
    });

    if (existingIntegration) {
      throw new ConflictException(`Integration with key '${createIntegrationDto.key}' already exists`);
    }

    const integration = this.integrationRepository.create(createIntegrationDto);
    return await this.integrationRepository.save(integration);
  }

  async findAll(type?: IntegrationType): Promise<IntegrationSettings[]> {
    const query = this.integrationRepository.createQueryBuilder('integration');
    
    if (type) {
      query.where('integration.type = :type', { type });
    }
    
    return await query.getMany();
  }

  async findActive(): Promise<IntegrationSettings[]> {
    return await this.integrationRepository.find({
      where: { isActive: true }
    });
  }

  async findOne(id: string): Promise<IntegrationSettings> {
    const integration = await this.integrationRepository.findOne({
      where: { id }
    });

    if (!integration) {
      throw new NotFoundException(`Integration with ID '${id}' not found`);
    }

    return integration;
  }

  async findByKey(key: string): Promise<IntegrationSettings> {
    const integration = await this.integrationRepository.findOne({
      where: { key }
    });

    if (!integration) {
      throw new NotFoundException(`Integration with key '${key}' not found`);
    }

    return integration;
  }

  async update(id: string, updateIntegrationDto: UpdateIntegrationSettingsDto): Promise<IntegrationSettings> {
    const integration = await this.findOne(id);
    
    Object.assign(integration, updateIntegrationDto);
    return await this.integrationRepository.save(integration);
  }

  async updateByKey(key: string, updateIntegrationDto: UpdateIntegrationSettingsDto): Promise<IntegrationSettings> {
    const integration = await this.findByKey(key);
    
    Object.assign(integration, updateIntegrationDto);
    return await this.integrationRepository.save(integration);
  }

  async remove(id: string): Promise<void> {
    const integration = await this.findOne(id);
    await this.integrationRepository.remove(integration);
  }

  async removeByKey(key: string): Promise<void> {
    const integration = await this.findByKey(key);
    await this.integrationRepository.remove(integration);
  }

  async toggleActive(id: string, isActive: boolean): Promise<IntegrationSettings> {
    const integration = await this.findOne(id);
    
    integration.isActive = isActive;
    return await this.integrationRepository.save(integration);
  }

  async updateConfig(id: string, config: Record<string, any>): Promise<IntegrationSettings> {
    const integration = await this.findOne(id);
    
    integration.config = {
      ...integration.config,
      ...config
    };
    
    return await this.integrationRepository.save(integration);
  }
}
