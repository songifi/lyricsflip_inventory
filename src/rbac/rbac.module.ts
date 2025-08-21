import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { RolesService } from './services/roles.service';
import { PermissionsService } from './services/permissions.service';
import { RolesController } from './roles.controller';
import { PermissionsController } from './permissions.controller';
import { User } from '../users/user.entity';
import { UserRolesService } from './services/user-roles.service';
import { UserRolesController } from './user-roles.controller';
import { RbacSeeder } from './rbac.seeder';
import { RbacService } from './services/rbac.service';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, User])],
  controllers: [RolesController, PermissionsController, UserRolesController],
  providers: [
    RolesService,
    PermissionsService,
    UserRolesService,
    RbacSeeder,
    RbacService,
    PermissionsGuard,
    RolesGuard,
  ],
  exports: [
    RolesService,
    PermissionsService,
    UserRolesService,
    RbacService,
    PermissionsGuard,
    RolesGuard,
    TypeOrmModule,
  ],
})
export class RbacModule {}
