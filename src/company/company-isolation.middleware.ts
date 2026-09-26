import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CompanyIsolationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const user = req.user as any;

    if (!user) {
      return next();
    }

    const companyId = req.params.id || req.body.companyId || req.query.companyId;

    if (companyId && user.companyId && companyId !== user.companyId) {
      throw new ForbiddenException('Access denied: cross-company isolation violation');
    }

    if (user.companyId) {
      req.headers['x-company-id'] = user.companyId;
    }

    next();
  }
}
