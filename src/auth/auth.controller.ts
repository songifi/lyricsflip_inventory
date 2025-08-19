import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RtAuthGuard } from './guards/rt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60 } })
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.email, dto.name, dto.password);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60 } })
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RtAuthGuard)
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Body('refreshToken') rt: string /* req.user from strategy */,
  ) {
    const payload: any = (global as any).reqUser;
    return this.auth.refresh(this.extractSub(rt), rt);
  }

  // Helper to get userId (sub) from refresh token after guard verification; minimal duplication.
  private extractSub(token: string): string {
    // Lightweight decode (no verify) to get payload; guard already validated signature/expiry
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString(),
    );
    return payload.sub;
  }

  // @Post('logout')
  // @UseGuards(JwtAuthGuard)
  // async logout(/* @Req() req */) {
  //   return {
  //     message: 'Use /me/logout in a real route that has access to req.user.sub',
  //   };
  // }
  // @Get('me')
  // @UseGuards(JwtAuthGuard)
  // whoami(/* @Req() req */) {
  //   return { message: 'You are authenticated. Access token is valid.' };
  // }
}
