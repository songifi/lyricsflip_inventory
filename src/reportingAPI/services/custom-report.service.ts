import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomReport } from '../entities/custom-report.entity';
import { CreateCustomReportDto } from '../dto/create-custom-report.dto';

@Injectable()
export class CustomReportService {
  constructor(
    @InjectRepository(CustomReport)
    private customReportRepository: Repository<CustomReport>,
  ) {}

  async create(createCustomReportDto: CreateCustomReportDto): Promise<CustomReport> {
    const customReport = this.customReportRepository.create(createCustomReportDto);
    return this.customReportRepository.save(customReport);
  }

  async findAll(page = 1, limit = 10, userId?: string): Promise<{ data: CustomReport[]; total: number; page: number; limit: number }> {
    const query = this.customReportRepository.createQueryBuilder('customReport');
    
    if (userId) {
      query.where('customReport.userId = :userId', { userId });
    }
    
    const [data, total] = await query
      .orderBy('customReport.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<CustomReport> {
    const customReport = await this.customReportRepository.findOne({ where: { id } });
    if (!customReport) {
      throw new NotFoundException(`Custom report with ID ${id} not found`);
    }
    return customReport;
  }

  async update(id: string, updateData: Partial<CustomReport>): Promise<CustomReport> {
    await this.customReportRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.customReportRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Custom report with ID ${id} not found`);
    }
  }

  async execute(id: string): Promise<any> {
    const customReport = await this.findOne(id);
    return this.buildQuery(customReport);
  }

  async getAvailableFields(): Promise<string[]> {
    return [
      'id',
      'name',
      'email',
      'created_at',
      'updated_at',
      'status',
      'amount',
      'quantity',
      'price',
      'category',
      'region',
      'date',
    ];
  }

  async preview(reportConfig: Partial<CustomReport>): Promise<any> {
    return this.buildQuery(reportConfig as CustomReport, true);
  }

  private buildQuery(customReport: CustomReport, isPreview = false): any {
    // Simulate building and executing a query based on the custom report configuration
    const result = {
      fields: customReport.fields,
      filters: customReport.filters,
      data: this.generateSampleData(customReport.fields, isPreview ? 5 : 100),
      totalRecords: isPreview ? 5 : 100,
      executedAt: new Date(),
    };

    if (customReport.groupBy) {
      result['groupBy'] = customReport.groupBy;
    }

    if (customReport.orderBy) {
      result['orderBy'] = customReport.orderBy;
    }

    return result;
  }

  private generateSampleData(fields: string[], recordCount: number): any[] {
    const data = [];
    
    for (let i = 0; i < recordCount; i++) {
      const record: any = {};
      
      fields.forEach(field => {
        switch (field) {
          case 'id':
            record[field] = `id_${i + 1}`;
            break;
          case 'name':
            record[field] = `Name ${i + 1}`;
            break;
          case 'email':
            record[field] = `user${i + 1}@example.com`;
            break;
          case 'amount':
            record[field] = Math.floor(Math.random() * 10000) + 100;
            break;
          case 'quantity':
            record[field] = Math.floor(Math.random() * 100) + 1;
            break;
          case 'price':
            record[field] = Math.floor(Math.random() * 1000) + 10;
            break;
          case 'category':
            record[field] = ['Electronics', 'Clothing', 'Books', 'Home'][Math.floor(Math.random() * 4)];
            break;
          case 'region':
            record[field] = ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)];
            break;
          case 'status':
            record[field] = ['Active', 'Inactive', 'Pending'][Math.floor(Math.random() * 3)];
            break;
          default:
            record[field] = `Value ${i + 1}`;
        }
      });
      
      data.push(record);
    }
    
    return data;
  }
}
