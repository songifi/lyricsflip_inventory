import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { RbacModule } from './rbac/rbac.module';
import { Role } from './rbac/entities/role.entity';
import { Permission } from './rbac/entities/permission.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get<string>('DB_HOST') ?? process.env.DB_HOST,
        port: Number(cfg.get<string>('DB_PORT') ?? process.env.DB_PORT),
        username: cfg.get<string>('DB_USERNAME') ?? process.env.DB_USERNAME,
        password: cfg.get<string>('DB_PASSWORD') ?? process.env.DB_PASSWORD,
        database: cfg.get<string>('DB_NAME') ?? process.env.DB_NAME,
        entities: [User, Role, Permission],
        synchronize: true, // disable in production and run migrations instead
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => [
        {
          ttl: parseInt(cfg.get('THROTTLE_TTL') ?? '60', 10),
          limit: parseInt(cfg.get('THROTTLE_LIMIT') ?? '10', 10),
        },
      ],
    }),
    UsersModule,
    RbacModule,
    AuthModule,
  ],
  providers: [
    // Global rate-limiting guard
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
