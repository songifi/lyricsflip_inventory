import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    try {
      if (this.dataSource.isInitialized) {
        this.logger.log('Database connection established successfully');
        await this.logConnectionInfo();
      }
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  private async logConnectionInfo() {
    try {
      const { driver } = this.dataSource;
      this.logger.log(`Connected to ${driver.database} on ${driver.options.host}:${driver.options.port}`);
      
      // Log pool information
      if (driver.master) {
        this.logger.log(`Connection pool: max ${driver.options.extra?.max || 'default'}`);
      }
    } catch (error) {
      this.logger.warn('Could not log connection info', error.message);
    }
  }

  /**
   * Get database connection health status
   */
  async getConnectionStatus(): Promise<{
    isConnected: boolean;
    database: string;
    schema: string;
    poolSize?: number;
  }> {
    try {
      const isConnected = this.dataSource.isInitialized;
      
      return {
        isConnected,
        database: this.dataSource.options.database as string,
        schema: (this.dataSource.options as any).schema || 'public',
        poolSize: (this.dataSource.options as any).poolSize,
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return {
        isConnected: false,
        database: 'unknown',
        schema: 'unknown',
      };
    }
  }

  /**
   * Execute raw query for multi-tenant operations
   */
  async executeRawQuery(query: string, parameters?: any[]): Promise<any> {
    try {
      return await this.dataSource.query(query, parameters);
    } catch (error) {
      this.logger.error('Raw query execution failed', error);
      throw error;
    }
  }

  /**
   * Switch schema for multi-tenant operations
   */
  async setSearchPath(schema: string): Promise<void> {
    try {
      await this.dataSource.query(`SET search_path TO ${schema}`);
      this.logger.debug(`Search path set to: ${schema}`);
    } catch (error) {
      this.logger.error(`Failed to set search path to ${schema}`, error);
      throw error;
    }
  }

  /**
   * Create schema for new tenant
   */
  async createSchema(schemaName: string): Promise<void> {
    try {
      await this.dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
      this.logger.log(`Schema created: ${schemaName}`);
    } catch (error) {
      this.logger.error(`Failed to create schema: ${schemaName}`, error);
      throw error;
    }
  }
}