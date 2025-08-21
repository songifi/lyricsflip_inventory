import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';

@Injectable()
export class CompanyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('Missing authenticated user');
    }
    if (!user.companyId) {
      throw new ForbiddenException('User is not associated with a company');
    }
    req.companyId = user.companyId;
    return true;
  }
}
