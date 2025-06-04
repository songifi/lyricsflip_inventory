import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UserRoleService } from '../services/user-role.service';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';

@Controller('user-roles')
@UseGuards(PermissionsGuard)
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @Post('assign')
  @RequirePermissions('users:update')
  assignRoles(@Body() assignRoleDto: AssignRoleDto) {
    return this.userRoleService.assignRoles(assignRoleDto);
  }

  @Delete(':userId/roles/:roleId')
  @RequirePermissions('users:update')
  removeRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.userRoleService.removeRole(userId, roleId);
  }

  @Get(':userId/roles')
  @RequirePermissions('users:read')
  getUserRoles(@Param('userId', ParseIntPipe) userId: number) {
    return this.userRoleService.getUserRoles(userId);
  }
}