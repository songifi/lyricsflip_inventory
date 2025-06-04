import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';

@ApiTags('roles')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  // Role endpoints
  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role successfully created', type: Role })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Role name already exists' })
  async createRole(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.roleService.createRole(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'List of roles', type: [Role] })
  async findAllRoles(): Promise<Role[]> {
    return this.roleService.findAllRoles();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Role found', type: Role })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findOneRole(@Param('id') id: string): Promise<Role> {
    return this.roleService.findOneRole(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Role successfully updated', type: Role })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 409, description: 'Role name already exists' })
  async updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto): Promise<Role> {
    return this.roleService.updateRole(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Role successfully deleted' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async removeRole(@Param('id') id: string): Promise<{ message: string }> {
    await this.roleService.removeRole(id);
    return { message: 'Role successfully deleted' };
  }

  // Permission endpoints
  @Post('permissions')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission successfully created', type: Permission })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Permission name already exists' })
  async createPermission(@Body() createPermissionDto: CreatePermissionDto): Promise<Permission> {
    return this.roleService.createPermission(createPermissionDto);
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, description: 'List of permissions', type: [Permission] })
  async findAllPermissions(): Promise<Permission[]> {
    return this.roleService.findAllPermissions();
  }

  @Get('permissions/:id')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiParam({ name: 'id', description: 'Permission ID', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Permission found', type: Permission })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async findOnePermission(@Param('id') id: string): Promise<Permission> {
    return this.roleService.findOnePermission(id);
  }

  @Patch('permissions/:id')
  @ApiOperation({ summary: 'Update permission by ID' })
  @ApiParam({ name: 'id', description: 'Permission ID', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Permission successfully updated', type: Permission })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 409, description: 'Permission name already exists' })
  async updatePermission(
    @Param('id') id: string,
    @Body() updatePermissionDto: Partial<CreatePermissionDto>
  ): Promise<Permission> {
    return this.roleService.updatePermission(id, updatePermissionDto);
  }

  @Delete('permissions/:id')
  @ApiOperation({ summary: 'Delete permission by ID' })
  @ApiParam({ name: 'id', description: 'Permission ID', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Permission successfully deleted' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async removePermission(@Param('id') id: string): Promise<{ message: string }> {
    await this.roleService.removePermission(id);
    return { message: 'Permission successfully deleted' };
  }

  // Role-Permission management endpoints
  @Post(':roleId/permissions')
  @ApiOperation({ summary: 'Assign permissions to role' })
  @ApiParam({ name: 'roleId', description: 'Role ID', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Permissions assigned to role', type: Role })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async assignPermissions(
    @Param('roleId') roleId: string,
    @Body() body: { permissionIds: string[] }
  ): Promise<Role> {
    return this.roleService.assignPermissionsToRole(roleId, body.permissionIds);
  }

  @Delete(':roleId/permissions')
  @ApiOperation({ summary: 'Remove permissions from role' })
  @ApiParam({ name: 'roleId', description: 'Role ID', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Permissions removed from role', type: Role })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async removePermissions(
    @Param('roleId') roleId: string,
    @Body() body: { permissionIds: string[] }
  ): Promise<Role> {
    return this.roleService.removePermissionsFromRole(roleId, body.permissionIds);
  }
} 