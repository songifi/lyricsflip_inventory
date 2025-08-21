import { Body, Controller, Get, Param, Post, Delete } from '@nestjs/common';
import { PermissionsService } from './services/permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly perms: PermissionsService) {}

  @Get()
  findAll() {
    return this.perms.findAll();
  }

  @Post()
  create(@Body() body: { name: string; description?: string }) {
    return this.perms.create(body.name, body.description);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.perms.remove(id);
  }
}
