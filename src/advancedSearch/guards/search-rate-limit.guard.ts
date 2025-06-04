import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchRateLimitGuard implements CanActivate {
  private readonly rateLimitIndex = 'search-rate-limits';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || request.ip;
    const currentMinute = Math.floor(Date.now() / 60000);

    try {
      const response = await this.elasticsearchService.search({
        index: this.rateLimitIndex,
        body: {
          query: {
            bool: {
              must: [
                { term: { userId } },
                { term: { minute: currentMinute } },
              ],
            },
          },
        },
      });

      const searchCount = response.body.hits.total.value;
      const rateLimit = 100; // 100 searches per minute

      if (searchCount >= rateLimit) {
        throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
      }

      // Track this search
      await this.elasticsearchService.index({
        index: this.rateLimitIndex,
        body: {
          userId,
          minute: currentMinute,
          timestamp: new Date(),
        },
      });

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      return true; // Allow if rate limiting fails
    }
  }
}