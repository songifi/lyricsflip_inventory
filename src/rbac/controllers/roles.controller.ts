import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { RequireRole } from '../decorators/roles.decorator';

@Controller('roles')
@UseGuards(PermissionsGuard, RolesGuard)
export class RolesController {
  constructor(private readonly roles: RolesService) {}

  @Get()
  @Permissions('roles.view')
  findAll() {
    return this.roles.findAll();
  }

  @Post()
  @Permissions('roles.create')
  @RequireRole('admin')
  create(
    @Body() body: { name: string; description?: string; parentId?: string },
  ) {
    return this.roles.create(body.name, body.description, body.parentId);
  }

  @Put(':id')
  @Permissions('roles.update')
  @RequireRole('admin')
  update(
    @Param('id') id: string,
    @Body()
    body: { name?: string; description?: string; parentId?: string | null },
  ) {
    return this.roles.update(id, body);
  }

  @Delete(':id')
  @Permissions('roles.delete')
  @RequireRole('admin')
  remove(@Param('id') id: string) {
    return this.roles.remove(id);
  }

  @Post(':id/permissions')
  @Permissions('roles.manage_permissions')
  @RequireRole('admin')
  addPermission(
    @Param('id') roleId: string,
    @Body() body: { id?: string; name?: string },
  ) {
    return this.roles.addPermission(roleId, body);
  }

  @Delete(':id/permissions/:permId')
  @Permissions('roles.manage_permissions')
  @RequireRole('admin')
  removePermission(
    @Param('id') roleId: string,
    @Param('permId') permId: string,
  ) {
    return this.roles.removePermission(roleId, permId);
  }
}
