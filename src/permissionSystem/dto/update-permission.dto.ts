import { PartialType } from '@nestjs/mapped-types';
import { CreatePermissionDto } from './create-permission.dto';

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}

// permissionSystem/dto/assign-role.dto.ts
import { IsNumber, IsArray } from 'class-validator';

export class AssignRoleDto {
  @IsNumber()
  userId: number;

  @IsArray()
  @IsNumber({}, { each: true })
  roleIds: number[];
}