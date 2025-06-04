import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchOptimizationTask {
  private readonly logger = new Logger(SearchOptimizationTask.name);

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async optimizeIndices() {
    this.logger.log('Starting index optimization...');

    try {
      const indices = await this.elasticsearchService.cat.indices({
        format: 'json',
      });

      for (const index of indices.body) {
        if (index.index.startsWith('.')) continue; // Skip system indices

        // Force merge to optimize segments
        await this.elasticsearchService.indices.forcemerge({
          index: index.index,
          max_num_segments: 1,
        });

        this.logger.log(`Optimized index: ${index.index}`);
      }
    } catch (error) {
      this.logger.error('Index optimization failed:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOldAnalytics() {
    this.logger.log('Cleaning up old analytics data...');

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90); // Keep 90 days

      await this.elasticsearchService.deleteByQuery({
        index: 'search-analytics',
        body: {
          query: {
            range: {
              timestamp: {
                lt: cutoffDate.toISOString(),
              },
            },
          },
        },
      });

      this.logger.log('Analytics cleanup completed');
    } catch (error) {
      this.logger.error('Analytics cleanup failed:', error);
    }
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async refreshIndices() {
    this.logger.log('Refreshing indices...');

    try {
      await this.elasticsearchService.indices.refresh({
        index: '_all',
      });

      this.logger.log('Indices refresh completed');
    } catch (error) {
      this.logger.error('Indices refresh failed:', error);
    }
  }
}
