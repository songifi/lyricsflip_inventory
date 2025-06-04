import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchAnalyticsDto } from '../dto/search-analytics.dto';
import { SearchAnalyticsResult } from '../interfaces/search-analytics-result.interface';

@Injectable()
export class SearchAnalyticsService {
  private readonly logger = new Logger(SearchAnalyticsService.name);
  private readonly analyticsIndex = 'search-analytics';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async trackSearch(searchData: {
    query: string;
    filters?: Record<string, any>;
    totalHits: number;
    responseTime: number;
    userId?: string;
  }): Promise<void> {
    try {
      await this.elasticsearchService.index({
        index: this.analyticsIndex,
        body: {
          ...searchData,
          timestamp: new Date(),
          sessionId: this.generateSessionId(),
        },
      });
    } catch (error) {
      this.logger.error('Failed to track search analytics:', error);
    }
  }

  async getSearchAnalytics(analyticsDto: SearchAnalyticsDto): Promise<SearchAnalyticsResult> {
    const { startDate, endDate, userId } = analyticsDto;
    
    const filter = [
      {
        range: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
    ];

    if (userId) {
      filter.push({ term: { userId } });
    }

    const response = await this.elasticsearchService.search({
      index: this.analyticsIndex,
      body: {
        query: {
          bool: { filter },
        },
        aggs: {
          total_searches: {
            value_count: { field: 'query.keyword' },
          },
          unique_queries: {
            cardinality: { field: 'query.keyword' },
          },
          avg_response_time: {
            avg: { field: 'responseTime' },
          },
          top_queries: {
            terms: {
              field: 'query.keyword',
              size: 10,
            },
          },
          zero_results: {
            filter: {
              term: { totalHits: 0 },
            },
          },
          search_volume_over_time: {
            date_histogram: {
              field: 'timestamp',
              calendar_interval: 'hour',
            },
          },
          response_time_percentiles: {
            percentiles: {
              field: 'responseTime',
              percents: [50, 90, 95, 99],
            },
          },
        },
        size: 0,
      },
    });

    return this.formatAnalyticsResponse(response);
  }

  async getPopularSearches(limit: number = 10): Promise<Array<{ query: string; count: number }>> {
    const response = await this.elasticsearchService.search({
      index: this.analyticsIndex,
      body: {
        query: {
          range: {
            timestamp: {
              gte: 'now-7d',
            },
          },
        },
        aggs: {
          top_queries: {
            terms: {
              field: 'query.keyword',
              size: limit,
            },
          },
        },
        size: 0,
      },
    });

    return response.body.aggregations.top_queries.buckets.map(bucket => ({
      query: bucket.key,
      count: bucket.doc_count,
    }));
  }

  async getSearchPerformanceMetrics(): Promise<{
    avgResponseTime: number;
    searchVolume: number;
    zeroResultsRate: number;
  }> {
    const response = await this.elasticsearchService.search({
      index: this.analyticsIndex,
      body: {
        query: {
          range: {
            timestamp: {
              gte: 'now-24h',
            },
          },
        },
        aggs: {
          avg_response_time: {
            avg: { field: 'responseTime' },
          },
          total_searches: {
            value_count: { field: 'query.keyword' },
          },
          zero_results: {
            filter: {
              term: { totalHits: 0 },
            },
          },
        },
        size: 0,
      },
    });

    const aggs = response.body.aggregations;
    const totalSearches = aggs.total_searches.value;
    const zeroResults = aggs.zero_results.doc_count;

    return {
      avgResponseTime: aggs.avg_response_time.value || 0,
      searchVolume: totalSearches,
      zeroResultsRate: totalSearches > 0 ? (zeroResults / totalSearches) * 100 : 0,
    };
  }

  private formatAnalyticsResponse(response: any): SearchAnalyticsResult {
    const aggs = response.body.aggregations;
    
    return {
      totalSearches: aggs.total_searches.value,
      uniqueQueries: aggs.unique_queries.value,
      avgResponseTime: aggs.avg_response_time.value,
      topQueries: aggs.top_queries.buckets.map(bucket => ({
        query: bucket.key,
        count: bucket.doc_count,
      })),
      zeroResultsCount: aggs.zero_results.doc_count,
      searchVolumeOverTime: aggs.search_volume_over_time.buckets.map(bucket => ({
        timestamp: bucket.key_as_string,
        count: bucket.doc_count,
      })),
      responseTimePercentiles: aggs.response_time_percentiles.values,
    };
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}