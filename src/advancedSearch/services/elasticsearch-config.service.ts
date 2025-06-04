import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchModuleOptions, ElasticsearchOptionsFactory } from '@nestjs/elasticsearch';

@Injectable()
export class ElasticsearchConfigService implements ElasticsearchOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createElasticsearchOptions(): ElasticsearchModuleOptions {
    return {
      node: this.configService.get<string>('ELASTICSEARCH_NODE', 'http://localhost:9200'),
      auth: {
        username: this.configService.get<string>('ELASTICSEARCH_USERNAME', 'elastic'),
        password: this.configService.get<string>('ELASTICSEARCH_PASSWORD', 'changeme'),
      },
      maxRetries: 10,
      requestTimeout: 60000,
      pingTimeout: 60000,
      sniffOnStart: true,
    };
  }
}