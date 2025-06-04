import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { IndexMappingDto } from '../dto/index-mapping.dto';

@Injectable()
export class SearchIndexService {
  private readonly logger = new Logger(SearchIndexService.name);

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async createIndex(indexName: string, mapping?: IndexMappingDto): Promise<void> {
    const indexExists = await this.elasticsearchService.indices.exists({
      index: indexName,
    });

    if (indexExists.body) {
      this.logger.warn(`Index ${indexName} already exists`);
      return;
    }

    const indexBody: any = {
      settings: {
        number_of_shards: 1,
        number_of_replicas: 1,
        analysis: {
          analyzer: {
            custom_analyzer: {
              type: 'custom',
              tokenizer: 'standard',
              filter: ['lowercase', 'stop', 'snowball'],
            },
          },
        },
      },
    };

    if (mapping) {
      indexBody.mappings = mapping;
    } else {
      indexBody.mappings = this.getDefaultMapping();
    }

    await this.elasticsearchService.indices.create({
      index: indexName,
      body: indexBody,
    });

    this.logger.log(`Created index: ${indexName}`);
  }

  async deleteIndex(indexName: string): Promise<void> {
    const exists = await this.elasticsearchService.indices.exists({
      index: indexName,
    });

    if (exists.body) {
      await this.elasticsearchService.indices.delete({
        index: indexName,
      });
      this.logger.log(`Deleted index: ${indexName}`);
    }
  }

  async indexDocument(indexName: string, document: any, id?: string): Promise<void> {
    const indexParams: any = {
      index: indexName,
      body: {
        ...document,
        indexedAt: new Date(),
      },
    };

    if (id) {
      indexParams.id = id;
    }

    await this.elasticsearchService.index(indexParams);
  }

  async bulkIndex(indexName: string, documents: Array<{ id?: string; document: any }>): Promise<void> {
    const body = documents.flatMap(({ id, document }) => [
      { index: { _index: indexName, ...(id && { _id: id }) } },
      { ...document, indexedAt: new Date() },
    ]);

    const response = await this.elasticsearchService.bulk({ body });

    if (response.body.errors) {
      const errors = response.body.items
        .filter(item => item.index?.error)
        .map(item => item.index.error);
      
      this.logger.error('Bulk indexing errors:', errors);
      throw new Error('Bulk indexing failed');
    }

    this.logger.log(`Bulk indexed ${documents.length} documents to ${indexName}`);
  }

  async updateDocument(indexName: string, id: string, updates: any): Promise<void> {
    await this.elasticsearchService.update({
      index: indexName,
      id,
      body: {
        doc: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    });
  }

  async deleteDocument(indexName: string, id: string): Promise<void> {
    await this.elasticsearchService.delete({
      index: indexName,
      id,
    });
  }

  async reindexData(sourceIndex: string, targetIndex: string): Promise<void> {
    await this.elasticsearchService.reindex({
      body: {
        source: { index: sourceIndex },
        dest: { index: targetIndex },
      },
    });

    this.logger.log(`Reindexed data from ${sourceIndex} to ${targetIndex}`);
  }

  async getIndexStats(indexName: string): Promise<any> {
    const stats = await this.elasticsearchService.indices.stats({
      index: indexName,
    });

    return stats.body.indices[indexName];
  }

  private getDefaultMapping() {
    return {
      properties: {
        title: {
          type: 'text',
          analyzer: 'custom_analyzer',
          fields: {
            keyword: {
              type: 'keyword',
              ignore_above: 256,
            },
          },
        },
        content: {
          type: 'text',
          analyzer: 'custom_analyzer',
        },
        description: {
          type: 'text',
          analyzer: 'custom_analyzer',
        },
        category: {
          type: 'text',
          fields: {
            keyword: {
              type: 'keyword',
              ignore_above: 256,
            },
          },
        },
        tags: {
          type: 'text',
          fields: {
            keyword: {
              type: 'keyword',
              ignore_above: 256,
            },
          },
        },
        author: {
          type: 'text',
          fields: {
            keyword: {
              type: 'keyword',
              ignore_above: 256,
            },
          },
        },
        status: {
          type: 'keyword',
        },
        price: {
          type: 'float',
        },
        createdAt: {
          type: 'date',
        },
        updatedAt: {
          type: 'date',
        },
        indexedAt: {
          type: 'date',
        },
      },
    };
  }
}