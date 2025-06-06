import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TenantContextService } from '../../tenant/tenant-context.service';

@Injectable()
export class TenantAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private tenantContext: TenantContextService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const tenantId = this.tenantContext.getTenantId();

      // Verify that the user belongs to the current tenant
      if (payload.tenantId !== tenantId) {
        throw new UnauthorizedException('Invalid tenant access');
      }

      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
