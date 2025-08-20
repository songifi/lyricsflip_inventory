import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RtAuthGuard extends AuthGuard('jwt-refresh') {}
