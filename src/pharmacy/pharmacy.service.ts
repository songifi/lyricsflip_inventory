import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';
import { Pharmacy } from './entities/pharmacy.entity';

@Injectable()
export class PharmacyService {
  constructor(
    @InjectRepository(Pharmacy)
    private readonly pharmacyRepo: Repository<Pharmacy>,
  ) {}

  // 🔹 Create new pharmacy
  async create(createPharmacyDto: CreatePharmacyDto): Promise<Pharmacy> {
    const pharmacy = this.pharmacyRepo.create(createPharmacyDto);
    return this.pharmacyRepo.save(pharmacy);
  }

  // 🔹 Find all pharmacies (basic full list)
  async findAll(): Promise<Pharmacy[]> {
    return this.pharmacyRepo.find({
      order: { updated_at: 'DESC' },
    });
  }

  // 🔹 Find single pharmacy by ID
  async findOne(id: number): Promise<Pharmacy> {
    const pharmacy = await this.pharmacyRepo.findOneBy({ id });
    if (!pharmacy) throw new NotFoundException(`Pharmacy ID ${id} not found`);
    return pharmacy;
  }

  // 🔹 Update pharmacy
  async update(id: number, updateDto: UpdatePharmacyDto): Promise<Pharmacy> {
    await this.pharmacyRepo.update(id, updateDto);
    return this.findOne(id);
  }

  // 🔹 Delete pharmacy
  async remove(id: number): Promise<void> {
    await this.pharmacyRepo.delete(id);
  }

  // 🔹 Pagination for mobile
  async paginate({
    page,
    perPage,
  }: {
    page: number;
    perPage: number;
  }): Promise<{ data: Pharmacy[]; total: number }> {
    const [data, total] = await this.pharmacyRepo.findAndCount({
      skip: (page - 1) * perPage,
      take: perPage,
      order: { updated_at: 'DESC' },
    });

    return { data, total };
  }

  // 🔹 Sync support: get updates since timestamp
  async getUpdatedSince(timestamp: string): Promise<Pharmacy[]> {
    return this.pharmacyRepo.find({
      where: {
        updated_at: MoreThan(new Date(timestamp)),
      },
      order: { updated_at: 'DESC' },
    });
  }
}
