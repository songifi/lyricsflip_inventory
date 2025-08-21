import { Controller, Param, Post, Delete, UseGuards } from '@nestjs/common';
import { UserRolesService } from './services/user-roles.service';
import { PermissionsGuard } from './guards/permissions.guard';
import { RequireRole } from './decorators/roles.decorator';

@Controller('users/:userId/roles')
@UseGuards(PermissionsGuard)
export class UserRolesController {
  constructor(private readonly userRoles: UserRolesService) {}

  @Post(':roleId')
  @RequireRole('admin')
  assign(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.userRoles.assign(userId, roleId);
  }

  @Delete(':roleId')
  @RequireRole('admin')
  remove(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.userRoles.remove(userId, roleId);
  }
}
