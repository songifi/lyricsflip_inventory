import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as crypto from 'crypto';

@Injectable()
export class SearchCacheMiddleware implements NestMiddleware {
  private readonly cacheIndex = 'search-cache';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.method !== 'POST' || !req.url.includes('/search')) {
      return next();
    }

    const cacheKey = this.generateCacheKey(req.body);
    
    try {
      // Try to get from cache
      const cachedResult = await this.getFromCache(cacheKey);
      if (cachedResult) {
        return res.json(cachedResult);
      }

      // Store original json method
      const originalJson = res.json.bind(res);
      
      // Override json method to cache the result
      res.json = (body: any) => {
        this.saveToCache(cacheKey, body);
        return originalJson(body);
      };

    } catch (error) {
      // If caching fails, continue without cache
    }

    next();
  }

  private generateCacheKey(searchParams: any): string {
    const normalized = JSON.stringify(searchParams, Object.keys(searchParams).sort());
    return crypto.createHash('md5').update(normalized).digest('hex');
  }

  private async getFromCache(cacheKey: string): Promise<any> {
    try {
      const response = await this.elasticsearchService.get({
        index: this.cacheIndex,
        id: cacheKey,
      });

      const cached = response.body._source;
      const expiresAt = new Date(cached.expiresAt);
      
      if (expiresAt > new Date()) {
        return cached.result;
      }

      // Cache expired, delete it
      await this.elasticsearchService.delete({
        index: this.cacheIndex,
        id: cacheKey,
      });

      return null;
    } catch (error) {
      return null;
    }
  }

  private async saveToCache(cacheKey: string, result: any): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      await this.elasticsearchService.index({
        index: this.cacheIndex,
        id: cacheKey,
        body: {
          result,
          cachedAt: new Date(),
          expiresAt,
        },
      });
    } catch (error) {
      // Ignore cache save errors
    }
  }
}
