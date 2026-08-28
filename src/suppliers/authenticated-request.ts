import type { Request } from 'express';

/**
 * A request that has passed `JwtAuthGuard` and `CompanyGuard`.
 *
 * Both guards run before every route in this module, so `user.companyId` is
 * always present by the time a handler reads it — `CompanyGuard` rejects the
 * request otherwise. Typing it here keeps `req.user.companyId` from being an
 * untyped `any` at every call site.
 */
export interface AuthenticatedRequest extends Request {
  user: {
    userId?: string;
    companyId: string;
  };
}
