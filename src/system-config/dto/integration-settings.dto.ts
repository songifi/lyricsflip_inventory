import { IsString, IsBoolean, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IntegrationType } from '../entities/integration-settings.entity';

export class CreateIntegrationSettingsDto {
  @ApiProperty({ description: 'Name of the integration' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Unique key for the integration' })
  @IsString()
  key: string;

  @ApiProperty({ 
    description: 'Type of integration',
    enum: IntegrationType,
    default: IntegrationType.API
  })
  @IsEnum(IntegrationType)
  type: IntegrationType;

  @ApiProperty({ description: 'Configuration for the integration' })
  @IsObject()
  config: Record<string, any>;

  @ApiProperty({ 
    description: 'Whether the integration is active',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Description of the integration', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Version of the integration', required: false })
  @IsString()
  @IsOptional()
  version?: string;

  @ApiProperty({ 
    description: 'Whether the integration requires authentication',
    default: false
  })
  @IsBoolean()
  @IsOptional()
  requiresAuthentication?: boolean;
}

export class UpdateIntegrationSettingsDto {
  @ApiProperty({ description: 'Name of the integration' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ 
    description: 'Type of integration',
    enum: IntegrationType
  })
  @IsEnum(IntegrationType)
  @IsOptional()
  type?: IntegrationType;

  @ApiProperty({ description: 'Configuration for the integration' })
  @IsObject()
  @IsOptional()
  config?: Record<string, any>;

  @ApiProperty({ description: 'Whether the integration is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Description of the integration' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Version of the integration' })
  @IsString()
  @IsOptional()
  version?: string;

  @ApiProperty({ description: 'Whether the integration requires authentication' })
  @IsBoolean()
  @IsOptional()
  requiresAuthentication?: boolean;
}
