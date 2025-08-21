import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { RbacService } from '../services/rbac.service';

type AuthUser = {
  id: string;
  email?: string;
  permissions?: string[];
  roles?: string[];
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    private readonly rbac: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPerms = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPerms || requiredPerms.length === 0) return true;

    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;
    if (!user) {
      this.logger.warn('No user found in request context');
      return false;
    }

    try {
      const effective = await this.rbac.getUserPermissions(user.id);
      const names = new Set<string>(effective.map((p) => p.name));
      const hasPermission = requiredPerms.some((p) => names.has(p));
      if (!hasPermission) {
        this.logger.warn(
          `User ${user.email || user.id} lacks required permissions: ${requiredPerms.join(
            ', ',
          )}. Available: ${Array.from(names).join(', ')}`,
        );
      }
      return hasPermission;
    } catch (error) {
      this.logger.error(
        `Error checking permissions for user ${user.email || user.id}:`,
        error,
      );
      return false;
    }
  }
}
