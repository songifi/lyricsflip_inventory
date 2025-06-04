import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Param,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdvancedSearchService } from '../services/advanced-search.service';
import { FacetedSearchService } from '../services/faceted-search.service';
import { SearchAnalyticsService } from '../services/search-analytics.service';
import { SearchIndexService } from '../services/search-index.service';
import { AdvancedSearchDto } from '../dto/advanced-search.dto';
import { FacetedSearchDto } from '../dto/faceted-search.dto';
import { SearchAnalyticsDto } from '../dto/search-analytics.dto';
import { IndexMappingDto } from '../dto/index-mapping.dto';

@ApiTags('Advanced Search')
@Controller('advanced-search')
export class AdvancedSearchController {
  constructor(
    private readonly advancedSearchService: AdvancedSearchService,
    private readonly facetedSearchService: FacetedSearchService,
    private readonly searchAnalyticsService: SearchAnalyticsService,
    private readonly searchIndexService: SearchIndexService,
  ) {}

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Perform advanced search' })
  @ApiResponse({ status: 200, description: 'Search results returned successfully' })
  async search(@Body() searchDto: AdvancedSearchDto) {
    return await this.advancedSearchService.search(searchDto);
  }

  @Post('search/multi-index')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search across multiple indices' })
  async searchMultipleIndices(
    @Body() searchDto: AdvancedSearchDto,
    @Query('indices') indices: string,
  ) {
    const indexArray = indices.split(',').map(index => index.trim());
    return await this.advancedSearchService.searchMultipleIndices(searchDto, indexArray);
  }

  @Post('search/highlight')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search with highlighting' })
  async searchWithHighlighting(@Body() searchDto: AdvancedSearchDto) {
    return await this.advancedSearchService.searchWithHighlighting(searchDto);
  }

  @Post('faceted-search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Perform faceted search' })
  async facetedSearch(@Body() searchDto: FacetedSearchDto) {
    return await this.facetedSearchService.facetedSearch(searchDto);
  }

  @Get('facets')
  @ApiOperation({ summary: 'Get facet counts' })
  async getFacetCounts(@Query('indices') indices?: string) {
    const indexArray = indices ? indices.split(',').map(index => index.trim()) : undefined;
    return await this.facetedSearchService.getFacetCounts(indexArray);
  }

  @Post('analytics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get search analytics' })
  async getSearchAnalytics(@Body() analyticsDto: SearchAnalyticsDto) {
    return await this.searchAnalyticsService.getSearchAnalytics(analyticsDto);
  }

  @Get('analytics/popular')
  @ApiOperation({ summary: 'Get popular searches' })
  async getPopularSearches(@Query('limit') limit: number = 10) {
    return await this.searchAnalyticsService.getPopularSearches(limit);
  }

  @Get('analytics/performance')
  @ApiOperation({ summary: 'Get search performance metrics' })
  async getSearchPerformanceMetrics() {
    return await this.searchAnalyticsService.getSearchPerformanceMetrics();
  }

  @Post('index/:indexName')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create search index' })
  async createIndex(
    @Param('indexName') indexName: string,
    @Body() mapping?: IndexMappingDto,
  ) {
    await this.searchIndexService.createIndex(indexName, mapping);
    return { success: true, message: `Index ${indexName} created successfully` };
  }

  @Post('index/:indexName/document')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Index a document' })
  async indexDocument(
    @Param('indexName') indexName: string,
    @Body() document: any,
    @Query('id') id?: string,
  ) {
    await this.searchIndexService.indexDocument(indexName, document, id);
    return { success: true, message: 'Document indexed successfully' };
  }

  @Post('index/:indexName/bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk index documents' })
  async bulkIndex(
    @Param('indexName') indexName: string,
    @Body() documents: Array<{ id?: string; document: any }>,
  ) {
    await this.searchIndexService.bulkIndex(indexName, documents);
    return { success: true, message: `${documents.length} documents indexed successfully` };
  }

  @Get('index/:indexName/stats')
  @ApiOperation({ summary: 'Get index statistics' })
  async getIndexStats(@Param('indexName') indexName: string) {
    return await this.searchIndexService.getIndexStats(indexName);
  }
}