import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { FacetedSearchDto } from '../dto/faceted-search.dto';
import { FacetedSearchResult } from '../interfaces/faceted-search-result.interface';

@Injectable()
export class FacetedSearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async facetedSearch(searchDto: FacetedSearchDto): Promise<FacetedSearchResult> {
    const searchRequest = {
      index: searchDto.indices || ['*'],
      body: {
        query: this.buildFacetedQuery(searchDto),
        aggs: this.buildFacetAggregations(searchDto),
        from: ((searchDto.page || 1) - 1) * (searchDto.limit || 10),
        size: searchDto.limit || 10,
      },
    };

    const response = await this.elasticsearchService.search(searchRequest);
    return this.formatFacetedResponse(response);
  }

  async getFacetCounts(indices: string[] = ['*']): Promise<Record<string, any>> {
    const response = await this.elasticsearchService.search({
      index: indices,
      body: {
        size: 0,
        aggs: {
          categories: {
            terms: { field: 'category.keyword', size: 50 },
          },
          tags: {
            terms: { field: 'tags.keyword', size: 100 },
          },
          authors: {
            terms: { field: 'author.keyword', size: 50 },
          },
          status: {
            terms: { field: 'status.keyword', size: 10 },
          },
          price_stats: {
            stats: { field: 'price' },
          },
          date_range: {
            date_range: {
              field: 'createdAt',
              ranges: [
                { key: 'last_week', from: 'now-7d' },
                { key: 'last_month', from: 'now-30d' },
                { key: 'last_year', from: 'now-365d' },
              ],
            },
          },
        },
      },
    });

    return response.body.aggregations;
  }

  private buildFacetedQuery(searchDto: FacetedSearchDto) {
    const must = [];
    const filter = [];

    if (searchDto.query) {
      must.push({
        multi_match: {
          query: searchDto.query,
          fields: ['title^3', 'content^2', 'description', 'tags^2'],
          type: 'best_fields',
        },
      });
    }

    if (searchDto.facets) {
      Object.entries(searchDto.facets).forEach(([field, values]) => {
        if (Array.isArray(values) && values.length > 0) {
          filter.push({
            terms: { [`${field}.keyword`]: values },
          });
        }
      });
    }

    return {
      bool: {
        must: must.length > 0 ? must : [{ match_all: {} }],
        filter,
      },
    };
  }

  private buildFacetAggregations(searchDto: FacetedSearchDto) {
    const aggs: Record<string, any> = {};

    const facetFields = searchDto.facetFields || [
      'category',
      'tags',
      'author',
      'status',
    ];

    facetFields.forEach(field => {
      aggs[field] = {
        terms: {
          field: `${field}.keyword`,
          size: 50,
        },
      };
    });

    // Add numeric facets
    if (searchDto.numericFacets) {
      searchDto.numericFacets.forEach(field => {
        aggs[`${field}_stats`] = {
          stats: { field },
        };
        aggs[`${field}_histogram`] = {
          histogram: {
            field,
            interval: searchDto.histogramInterval || 10,
          },
        };
      });
    }

    return aggs;
  }

  private formatFacetedResponse(response: any): FacetedSearchResult {
    return {
      hits: response.body.hits.hits.map(hit => ({
        id: hit._id,
        source: hit._source,
        score: hit._score,
        index: hit._index,
      })),
      total: response.body.hits.total.value,
      facets: response.body.aggregations || {},
      took: response.body.took,
    };
  }
}