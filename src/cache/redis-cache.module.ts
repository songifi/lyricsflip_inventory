import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST ?? 'localhost',
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
      ttl: process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : 60,
    }),
  ],
  exports: [CacheModule],
})
export class RedisCacheModule {}