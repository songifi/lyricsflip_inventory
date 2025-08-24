import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PermissionsService } from '../services/permissions.service';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequireRole } from '../decorators/roles.decorator';
import { Permissions } from '../decorators/permissions.decorator';

@Controller('permissions')
@UseGuards(PermissionsGuard)
export class PermissionsController {
  constructor(private readonly perms: PermissionsService) {}

  @Get()
  @Permissions('permissions.view')
  findAll() {
    return this.perms.findAll();
  }

  @Post()
  @Permissions('permissions.create')
  @RequireRole('admin')
  create(@Body() body: { name: string; description?: string }) {
    return this.perms.create(body.name, body.description);
  }

  @Delete(':id')
  @Permissions('permissions.delete')
  @RequireRole('admin')
  remove(@Param('id') id: string) {
    return this.perms.remove(id);
  }
}
