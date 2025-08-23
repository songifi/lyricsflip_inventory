import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import {
  Setting,
  SettingScope,
  SettingCategory,
  SettingType,
} from '../entities/setting.entity';
import {
  SettingHistory,
  SettingChangeType,
} from '../entities/setting-history.entity';
import { CreateSettingDto } from '../dto/create-setting.dto';
import { UpdateSettingDto } from '../dto/update-setting.dto';
import { UpdateSettingValueDto } from '../dto/setting-value.dto';
import { SettingQueryDto } from '../dto/setting-query.dto';
import { SettingResponseDto } from '../dto/setting-response.dto';
import { SettingsBackupDto, RestoreSettingsDto } from '../dto/setting-backup.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    @InjectRepository(SettingHistory)
    private readonly settingHistoryRepository: Repository<SettingHistory>,
  ) {}

  async create(
    createSettingDto: CreateSettingDto,
    userId?: string,
  ): Promise<SettingResponseDto> {
const existing = await this.settingRepository.findOne({
  where: {
    key: createSettingDto.key,
    scope: createSettingDto.scope,
    ...(createSettingDto.companyId
      ? { companyId: createSettingDto.companyId }
      : { companyId: IsNull() }),
  },
});
    if (existing) {
      throw new ConflictException('Setting with this key already exists');
    }

    if (createSettingDto.scope === SettingScope.COMPANY && !createSettingDto.companyId) {
      throw new BadRequestException('Company ID is required for company-scoped settings');
    }

    const setting = this.settingRepository.create({
      ...createSettingDto,
      createdBy: userId,
      updatedBy: userId,
    });

    if (createSettingDto.value !== undefined) {
      this.validateSettingValue(setting, createSettingDto.value);
      setting.setValue(createSettingDto.value);
    }

    const savedSetting = await this.settingRepository.save(setting);

    await this.logSettingChange(
      savedSetting,
      SettingChangeType.CREATED,
      null,
      savedSetting.value,
      userId,
      'Setting created',
    );

    return this.toResponseDto(savedSetting);
  }

  async findAll(query: SettingQueryDto): Promise<SettingResponseDto[]> {
    const queryBuilder = this.settingRepository.createQueryBuilder('setting');

    if (query.scope) {
      queryBuilder.andWhere('setting.scope = :scope', { scope: query.scope });
    }

    if (query.category) {
      queryBuilder.andWhere('setting.category = :category', {
        category: query.category,
      });
    }

    if (query.companyId) {
      queryBuilder.andWhere('setting.companyId = :companyId', {
        companyId: query.companyId,
      });
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(setting.key ILIKE :search OR setting.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (!query.includeInactive) {
      queryBuilder.andWhere('setting.isActive = true');
    }

    if (!query.includeReadonly) {
      queryBuilder.andWhere('setting.isReadonly = false');
    }

    queryBuilder.orderBy('setting.category', 'ASC')
      .addOrderBy('setting.key', 'ASC');

    const settings = await queryBuilder.getMany();
    return settings.map(setting => this.toResponseDto(setting));
  }

  async findByKey(
    key: string,
    companyId?: string,
  ): Promise<SettingResponseDto> {
    const setting = await this.getSettingByKey(key, companyId);
    return this.toResponseDto(setting);
  }

  async updateByKey(
    key: string,
    updateDto: UpdateSettingValueDto,
    userId?: string,
    companyId?: string,
  ): Promise<SettingResponseDto> {
    const setting = await this.getSettingByKey(key, companyId);

    if (setting.isReadonly) {
      throw new ForbiddenException('This setting is read-only');
    }

    this.validateSettingValue(setting, updateDto.value);

    const oldValue = setting.value;
    setting.setValue(updateDto.value);
    setting.updatedBy = userId ?? 'system';

    const updatedSetting = await this.settingRepository.save(setting);

    await this.logSettingChange(
      setting,
      SettingChangeType.UPDATED,
      oldValue,
      setting.value,
      userId,
      updateDto.reason,
    );

    return this.toResponseDto(updatedSetting);
  }

  async update(
    id: string,
    updateDto: UpdateSettingDto,
    userId?: string,
  ): Promise<SettingResponseDto> {
    const setting = await this.settingRepository.findOne({
      where: { id },
    });

    if (!setting) {
      throw new NotFoundException('Setting not found');
    }

    if (setting.isReadonly) {
      throw new ForbiddenException('This setting is read-only');
    }

    const oldValue = setting.value;
    Object.assign(setting, updateDto);
    setting.updatedBy = userId ??  'system';

    if (updateDto.value !== undefined) {
      this.validateSettingValue(setting, updateDto.value);
      setting.setValue(updateDto.value);
    }

    const updatedSetting = await this.settingRepository.save(setting);

    if (oldValue !== setting.value) {
      await this.logSettingChange(
        setting,
        SettingChangeType.UPDATED,
        oldValue,
        setting.value,
        userId,
        'Setting updated via full update',
      );
    }

    return this.toResponseDto(updatedSetting);
  }

  async delete(id: string, userId?: string): Promise<void> {
    const setting = await this.settingRepository.findOne({
      where: { id },
    });

    if (!setting) {
      throw new NotFoundException('Setting not found');
    }

    if (setting.isReadonly) {
      throw new ForbiddenException('This setting is read-only');
    }

    await this.logSettingChange(
      setting,
      SettingChangeType.DELETED,
      setting.value,
      null,
      userId,
      'Setting deleted',
    );

    await this.settingRepository.remove(setting);
  }

  async getCategories(): Promise<{ category: SettingCategory; count: number }[]> {
    const result = await this.settingRepository
      .createQueryBuilder('setting')
      .select('setting.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('setting.isActive = true')
      .groupBy('setting.category')
      .orderBy('setting.category', 'ASC')
      .getRawMany();

    return result.map(item => ({
      category: item.category,
      count: parseInt(item.count, 10),
    }));
  }

  async getCompanySettings(
    companyId: string,
    query?: SettingQueryDto,
  ): Promise<SettingResponseDto[]> {
    const companyQuery: SettingQueryDto = {
      ...query,
      companyId,
      scope: SettingScope.COMPANY,
    };

    return this.findAll(companyQuery);
  }

  async createBackup(
    scope?: SettingScope,
    companyId?: string,
    description?: string,
  ): Promise<SettingsBackupDto> {
    const queryBuilder = this.settingRepository.createQueryBuilder('setting');

    if (scope) {
      queryBuilder.where('setting.scope = :scope', { scope });
    }

    if (companyId) {
      queryBuilder.andWhere('setting.companyId = :companyId', { companyId });
    }

    const settings = await queryBuilder.getMany();

    return {
      settings: settings.map(setting => this.toResponseDto(setting)),
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      description,
    };
  }

  async restoreFromBackup(
    backupData: RestoreSettingsDto,
    userId?: string,
  ): Promise<{ created: number; updated: number; errors: string[] }> {
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const settingData of backupData.settings) {
      try {
        const existing = await this.settingRepository.findOne({
          where: {
            key: settingData.key,
            scope: settingData.scope,
            companyId: settingData.companyId ? settingData.companyId : IsNull(),
          },
        });

        if (existing) {
          if (existing.isReadonly) {
            errors.push(`Setting ${settingData.key} is read-only and cannot be restored`);
            continue;
          }

          const oldValue = existing.value;
          Object.assign(existing, settingData);
          existing.updatedBy = userId ?? 'system';

          if (settingData.value !== undefined) {
            existing.setValue(settingData.value);
          }

          await this.settingRepository.save(existing);

          await this.logSettingChange(
            existing,
            SettingChangeType.RESTORED,
            oldValue,
            existing.value,
            userId,
            backupData.reason,
          );

          updated++;
        } else {
          const newSetting = await this.create(settingData, userId);
          created++;
        }
      } catch (error) {
        errors.push(`Error restoring setting ${settingData.key}: ${error.message}`);
      }
    }

    return { created, updated, errors };
  }

  async getSettingHistory(
    key: string,
    companyId?: string,
    limit = 50,
  ): Promise<SettingHistory[]> {
    const setting = await this.getSettingByKey(key, companyId);

    return this.settingHistoryRepository.find({
      where: { settingId: setting.id },
      relations: ['changedByUser'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  private async getSettingByKey(
    key: string,
    companyId?: string,
  ): Promise<Setting> {
    const queryBuilder = this.settingRepository.createQueryBuilder('setting');

    queryBuilder.where('setting.key = :key', { key });

    if (companyId) {
      queryBuilder.andWhere(
        '(setting.companyId = :companyId OR (setting.scope = :systemScope AND setting.companyId IS NULL))',
        { companyId, systemScope: SettingScope.SYSTEM },
      );
      queryBuilder.orderBy(
        'CASE WHEN setting.companyId = :companyId THEN 0 ELSE 1 END',
        'ASC',
      );
    } else {
      queryBuilder.andWhere('setting.companyId IS NULL');
    }

    const setting = await queryBuilder.getOne();

    if (!setting) {
      throw new NotFoundException(`Setting with key '${key}' not found`);
    }

    return setting;
  }

  private validateSettingValue(setting: Setting, value: any): void {
    if (!setting.validation) return;

    const { validation } = setting;

    if (validation.required && (value === null || value === undefined || value === '')) {
      throw new BadRequestException('This setting is required');
    }

    switch (setting.type) {
      case SettingType.NUMBER:
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          throw new BadRequestException('Value must be a valid number');
        }
        if (validation.min !== undefined && numValue < validation.min) {
          throw new BadRequestException(`Value must be at least ${validation.min}`);
        }
        if (validation.max !== undefined && numValue > validation.max) {
          throw new BadRequestException(`Value must be at most ${validation.max}`);
        }
        break;

      case SettingType.STRING:
        const strValue = value.toString();
        if (validation.minLength !== undefined && strValue.length < validation.minLength) {
          throw new BadRequestException(`Value must be at least ${validation.minLength} characters`);
        }
        if (validation.maxLength !== undefined && strValue.length > validation.maxLength) {
          throw new BadRequestException(`Value must be at most ${validation.maxLength} characters`);
        }
        if (validation.pattern) {
          const regex = new RegExp(validation.pattern);
          if (!regex.test(strValue)) {
            throw new BadRequestException('Value does not match required pattern');
          }
        }
        if (validation.options && !validation.options.includes(strValue)) {
          throw new BadRequestException(`Value must be one of: ${validation.options.join(', ')}`);
        }
        break;

      case SettingType.JSON:
      case SettingType.ARRAY:
        try {
          JSON.parse(value);
        } catch {
          throw new BadRequestException('Value must be valid JSON');
        }
        break;

      case SettingType.BOOLEAN:
        const boolStr = value.toString().toLowerCase();
        if (!['true', 'false'].includes(boolStr)) {
          throw new BadRequestException('Value must be true or false');
        }
        break;
    }
  }

private async logSettingChange(
  setting: Setting,
  changeType: SettingChangeType,
  oldValue: string | null,
  newValue: string | null,
  userId?: string,
  reason?: string,
): Promise<void> {
  const historyData = {
    settingId: setting.id,
    settingKey: setting.key,
    oldValue: oldValue ?? undefined,
    newValue: newValue ?? undefined,
    changeType,
    reason,
    changedBy: userId,
  };

  const history = this.settingHistoryRepository.create(historyData);

  await this.settingHistoryRepository.save(history);
}
  private toResponseDto(setting: Setting): SettingResponseDto {
    return {
      id: setting.id,
      key: setting.key,
      value: setting.value,
      parsedValue: setting.getParsedValue(),
      type: setting.type,
      scope: setting.scope,
      category: setting.category,
      companyId: setting.companyId,
      description: setting.description,
      validation: setting.validation,
      metadata: setting.metadata,
      isActive: setting.isActive,
      isReadonly: setting.isReadonly,
      defaultValue: setting.defaultValue,
      createdBy: setting.createdBy,
      updatedBy: setting.updatedBy,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
    };
  }
}