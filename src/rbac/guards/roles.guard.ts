import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

type AuthUser = {
  id: string;
  roles?: string[];
  email?: string;
};

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;

    if (!user) {
      this.logger.warn('No user found in request context');
      return false;
    }

    if (!user.roles || user.roles.length === 0) {
      this.logger.warn(`User ${user.email || user.id} has no roles assigned`);
      return false;
    }

    // Check if user has any of the required roles
    const hasRole = requiredRoles.some((role) =>
      user.roles!.some((userRole) => userRole === role),
    );

    if (!hasRole) {
      this.logger.warn(
        `User ${user.email || user.id} lacks required roles: ${requiredRoles.join(', ')}. Available: ${user.roles.join(', ')}`,
      );
    }

    return hasRole;
  }
}
