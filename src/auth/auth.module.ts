import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RtStrategy } from './strategies/rt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({}), // dynamic in service
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RtStrategy],
})
export class AuthModule {}
