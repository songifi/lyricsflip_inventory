import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheMetricsService } from './cache.metrics.service';

@Injectable()
export class CachingService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private cacheMetrics: CacheMetricsService
  ) {}

  async get<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.cacheManager.get<T>(key);
    
    if (cached) {
      this.cacheMetrics.incrementHit();
      return cached;
    }

    this.cacheMetrics.incrementMiss();
    const result = await fn();
    if (ttl !== undefined) {
      await this.cacheManager.set(key, result, { ttl });
    } else {
      await this.cacheManager.set(key, result);
    }
    return result;
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }
}