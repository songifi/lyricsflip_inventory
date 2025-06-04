import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSettings } from './entities/system-settings.entity';
import { CreateSystemSettingDto, UpdateSystemSettingDto } from './dto/system-settings.dto';

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectRepository(SystemSettings)
    private readonly settingsRepository: Repository<SystemSettings>,
  ) {}

  async create(createSettingDto: CreateSystemSettingDto): Promise<SystemSettings> {
    const existingSetting = await this.settingsRepository.findOne({
      where: { key: createSettingDto.key }
    });

    if (existingSetting) {
      throw new ConflictException(`Setting with key '${createSettingDto.key}' already exists`);
    }

    const setting = this.settingsRepository.create(createSettingDto);
    return await this.settingsRepository.save(setting);
  }

  async findAll(category?: string): Promise<SystemSettings[]> {
    const query = this.settingsRepository.createQueryBuilder('setting');
    
    if (category) {
      query.where('setting.category = :category', { category });
    }
    
    return await query.getMany();
  }

  async findOne(id: string): Promise<SystemSettings> {
    const setting = await this.settingsRepository.findOne({
      where: { id }
    });

    if (!setting) {
      throw new NotFoundException(`Setting with ID '${id}' not found`);
    }

    return setting;
  }

  async findByKey(key: string): Promise<SystemSettings> {
    const setting = await this.settingsRepository.findOne({
      where: { key }
    });

    if (!setting) {
      throw new NotFoundException(`Setting with key '${key}' not found`);
    }

    return setting;
  }

  async update(id: string, updateSettingDto: UpdateSystemSettingDto): Promise<SystemSettings> {
    const setting = await this.findOne(id);
    
    // Check if the setting is editable
    if (!setting.isEditable) {
      throw new ConflictException(`Setting '${setting.key}' is not editable`);
    }
    
    Object.assign(setting, updateSettingDto);
    return await this.settingsRepository.save(setting);
  }

  async updateByKey(key: string, updateSettingDto: UpdateSystemSettingDto): Promise<SystemSettings> {
    const setting = await this.findByKey(key);
    
    // Check if the setting is editable
    if (!setting.isEditable) {
      throw new ConflictException(`Setting '${key}' is not editable`);
    }
    
    Object.assign(setting, updateSettingDto);
    return await this.settingsRepository.save(setting);
  }

  async remove(id: string): Promise<void> {
    const setting = await this.findOne(id);
    await this.settingsRepository.remove(setting);
  }

  async removeByKey(key: string): Promise<void> {
    const setting = await this.findByKey(key);
    await this.settingsRepository.remove(setting);
  }

  async getValueByKey(key: string): Promise<string> {
    const setting = await this.findByKey(key);
    return setting.value;
  }

  async bulkCreate(settings: CreateSystemSettingDto[]): Promise<SystemSettings[]> {
    const results: SystemSettings[] = [];
    
    for (const settingDto of settings) {
      try {
        const setting = await this.create(settingDto);
        results.push(setting);
      } catch (error) {
        // Skip if setting already exists
        if (!(error instanceof ConflictException)) {
          throw error;
        }
      }
    }
    
    return results;
  }
}
