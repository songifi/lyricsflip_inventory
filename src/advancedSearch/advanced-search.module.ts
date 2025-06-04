import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdvancedSearchService } from './services/advanced-search.service';
import { SearchAnalyticsService } from './services/search-analytics.service';
import { ElasticsearchConfigService } from './services/elasticsearch-config.service';
import { AdvancedSearchController } from './controllers/advanced-search.controller';
import { SearchIndexService } from './services/search-index.service';
import { FacetedSearchService } from './services/faceted-search.service';

@Module({
  imports: [
    ConfigModule,
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useClass: ElasticsearchConfigService,
    }),
  ],
  providers: [
    AdvancedSearchService,
    SearchAnalyticsService,
    ElasticsearchConfigService,
    SearchIndexService,
    FacetedSearchService,
  ],
  controllers: [AdvancedSearchController],
  exports: [
    AdvancedSearchService,
    SearchAnalyticsService,
    SearchIndexService,
    FacetedSearchService,
  ],
})
export class AdvancedSearchModule {}