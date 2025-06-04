import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from './environment.config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get nodeEnv(): Environment {
    return this.configService.get<Environment>('app.nodeEnv');
  }

  get port(): number {
    return this.configService.get<number>('app.port');
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === Environment.Development;
  }

  get isProduction(): boolean {
    return this.nodeEnv === Environment.Production;
  }

  get isTest(): boolean {
    return this.nodeEnv === Environment.Test;
  }

  get database() {
    return {
      host: this.configService.get<string>('app.database.host'),
      port: this.configService.get<number>('app.database.port'),
      username: this.configService.get<string>('app.database.username'),
      password: this.configService.get<string>('app.database.password'),
      name: this.configService.get<string>('app.database.name'),
    };
  }

  get jwt() {
    return {
      secret: this.configService.get<string>('app.jwt.secret'),
      expiresIn: this.configService.get<string>('app.jwt.expiresIn'),
    };
  }

  get redis() {
    return {
      host: this.configService.get<string>('app.redis.host'),
      port: this.configService.get<number>('app.redis.port'),
      password: this.configService.get<string>('app.redis.password'),
    };
  }
}
