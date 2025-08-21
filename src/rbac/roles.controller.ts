import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { RolesService } from './services/roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly roles: RolesService) {}

  @Get()
  findAll() {
    return this.roles.findAll();
  }

  @Post()
  create(
    @Body() body: { name: string; description?: string; parentId?: string },
  ) {
    return this.roles.create(body.name, body.description, body.parentId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: { name?: string; description?: string; parentId?: string | null },
  ) {
    return this.roles.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roles.remove(id);
  }

  @Post(':id/permissions')
  addPermission(
    @Param('id') roleId: string,
    @Body() body: { id?: string; name?: string },
  ) {
    return this.roles.addPermission(roleId, body);
  }

  @Delete(':id/permissions/:permId')
  removePermission(
    @Param('id') roleId: string,
    @Param('permId') permId: string,
  ) {
    return this.roles.removePermission(roleId, permId);
  }
}
