import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ example: 'user:read', description: 'Permission name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Permission to read user data', description: 'Permission description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'users', description: 'Resource the permission applies to' })
  @IsString()
  resource: string;

  @ApiProperty({ example: 'read', description: 'Action the permission allows' })
  @IsString()
  action: string;

  @ApiPropertyOptional({ example: true, description: 'Permission active status', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 