import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company, CompanyStatus } from './company.entity';
import * as slug from 'slug';

export interface CreateCompanyDto {
  name: string;
  description?: string;
  email: string;
  phone?: string;
  website?: string;
  ownerId: string;
}

export interface UpdateCompanyDto {
  name?: string;
  description?: string;
  logoUrl?: string;
  email?: string;
  phone?: string;
  website?: string;
  status?: CompanyStatus;
}

export interface CompanySettings {
  [key: string]: any;
}

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const existingCompany = await this.companyRepository.findOne({
      where: { email: createCompanyDto.email },
    });

    if (existingCompany) {
      throw new ConflictException('Company with this email already exists');
    }

    const companySlug = slug(createCompanyDto.name, { lower: true });
    const existingSlug = await this.companyRepository.findOne({
      where: { slug: companySlug },
    });

    if (existingSlug) {
      throw new ConflictException('Company with this name already exists');
    }

    const company = this.companyRepository.create({
      ...createCompanyDto,
      slug: companySlug,
      settings: {
        timezone: 'UTC',
        currency: 'USD',
        language: 'en',
        notifications: {
          email: true,
          push: true,
        },
      },
    });

    return this.companyRepository.save(company);
  }

  async findAll(): Promise<Company[]> {
    return this.companyRepository.find({
      where: { status: CompanyStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }

  async findBySlug(companySlug: string): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { slug: companySlug } });
    if (!company) {
      throw new NotFoundException(`Company with slug ${companySlug} not found`);
    }
    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    const company = await this.findById(id);

    if (updateCompanyDto.email && updateCompanyDto.email !== company.email) {
      const existing = await this.companyRepository.findOne({
        where: { email: updateCompanyDto.email },
      });
      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    if (updateCompanyDto.name && updateCompanyDto.name !== company.name) {
      const newSlug = slug(updateCompanyDto.name, { lower: true });
      const existingSlug = await this.companyRepository.findOne({
        where: { slug: newSlug },
      });
      if (existingSlug && existingSlug.id !== id) {
        throw new ConflictException('Company name already in use');
      }
      company.slug = newSlug;
    }

    Object.assign(company, updateCompanyDto);
    return this.companyRepository.save(company);
  }

  async remove(id: string): Promise<void> {
    const company = await this.findById(id);
    await this.companyRepository.remove(company);
  }

  async getSettings(id: string): Promise<CompanySettings> {
    const company = await this.findById(id);
    return company.settings || {};
  }

  async updateSettings(id: string, settings: CompanySettings): Promise<CompanySettings> {
    const company = await this.findById(id);
    company.settings = { ...company.settings, ...settings };
    await this.companyRepository.save(company);
    return company.settings;
  }

  async updateStatus(id: string, status: CompanyStatus): Promise<Company> {
    const company = await this.findById(id);
    company.status = status;
    return this.companyRepository.save(company);
  }

  async findByOwnerId(ownerId: string): Promise<Company[]> {
    return this.companyRepository.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }
}
