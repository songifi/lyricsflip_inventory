import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchRequest, SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import { AdvancedSearchDto } from '../dto/advanced-search.dto';
import { SearchResult } from '../interfaces/search-result.interface';
import { SearchAnalyticsService } from './search-analytics.service';

@Injectable()
export class AdvancedSearchService {
  private readonly logger = new Logger(AdvancedSearchService.name);

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly searchAnalyticsService: SearchAnalyticsService,
  ) {}

  async search(searchDto: AdvancedSearchDto): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      const searchRequest = this.buildSearchRequest(searchDto);
      const response = await this.elasticsearchService.search(searchRequest);
      
      const result = this.formatSearchResponse(response);
      
      // Track search analytics
      await this.searchAnalyticsService.trackSearch({
        query: searchDto.query,
        filters: searchDto.filters,
        totalHits: result.total,
        responseTime: Date.now() - startTime,
        userId: searchDto.userId,
      });

      return result;
    } catch (error) {
      this.logger.error('Search error:', error);
      throw error;
    }
  }

  async searchMultipleIndices(searchDto: AdvancedSearchDto, indices: string[]): Promise<SearchResult> {
    const searchRequest = this.buildSearchRequest(searchDto);
    searchRequest.index = indices;

    const response = await this.elasticsearchService.search(searchRequest);
    return this.formatSearchResponse(response);
  }

  async searchWithHighlighting(searchDto: AdvancedSearchDto): Promise<SearchResult> {
    const searchRequest = this.buildSearchRequest(searchDto);
    
    searchRequest.body.highlight = {
      fields: {
        title: {},
        content: {},
        description: {},
        tags: {},
      },
      pre_tags: ['<mark>'],
      post_tags: ['</mark>'],
    };

    const response = await this.elasticsearchService.search(searchRequest);
    return this.formatSearchResponse(response);
  }

  private buildSearchRequest(searchDto: AdvancedSearchDto): SearchRequest {
    const {
      query,
      filters = {},
      sortBy = '_score',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
      indices = ['*'],
    } = searchDto;

    const searchRequest: SearchRequest = {
      index: indices,
      body: {
        query: this.buildQuery(query, filters),
        sort: this.buildSort(sortBy, sortOrder),
        from: (page - 1) * limit,
        size: limit,
        aggs: this.buildAggregations(searchDto),
      },
    };

    return searchRequest;
  }

  private buildQuery(query: string, filters: Record<string, any>) {
    const mustClauses = [];
    const filterClauses = [];

    // Main text search
    if (query) {
      mustClauses.push({
        multi_match: {
          query,
          fields: [
            'title^3',
            'content^2',
            'description^1.5',
            'tags^2',
            'category^1.5',
            'author^1',
          ],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        filterClauses.push({
          terms: { [key]: value },
        });
      } else if (typeof value === 'object' && value.from !== undefined && value.to !== undefined) {
        filterClauses.push({
          range: {
            [key]: {
              gte: value.from,
              lte: value.to,
            },
          },
        });
      } else {
        filterClauses.push({
          term: { [key]: value },
        });
      }
    });

    return {
      bool: {
        must: mustClauses.length > 0 ? mustClauses : [{ match_all: {} }],
        filter: filterClauses,
      },
    };
  }

  private buildSort(sortBy: string, sortOrder: string) {
    if (sortBy === '_score') {
      return [{ _score: { order: sortOrder } }];
    }

    return [
      { [sortBy]: { order: sortOrder } },
      { _score: { order: 'desc' } },
    ];
  }

  private buildAggregations(searchDto: AdvancedSearchDto) {
    return {
      categories: {
        terms: { field: 'category.keyword', size: 10 },
      },
      tags: {
        terms: { field: 'tags.keyword', size: 20 },
      },
      authors: {
        terms: { field: 'author.keyword', size: 10 },
      },
      date_histogram: {
        date_histogram: {
          field: 'createdAt',
          calendar_interval: 'month',
        },
      },
      price_ranges: {
        range: {
          field: 'price',
          ranges: [
            { to: 50 },
            { from: 50, to: 100 },
            { from: 100, to: 200 },
            { from: 200 },
          ],
        },
      },
    };
  }

  private formatSearchResponse(response: SearchResponse): SearchResult {
    return {
      hits: response.body.hits.hits.map(hit => ({
        id: hit._id,
        source: hit._source,
        score: hit._score,
        highlight: hit.highlight || {},
        index: hit._index,
      })),
      total: response.body.hits.total.value,
      maxScore: response.body.hits.max_score,
      aggregations: response.body.aggregations || {},
      took: response.body.took,
    };
  }
}