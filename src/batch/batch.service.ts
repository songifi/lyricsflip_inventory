import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Batch } from './entities/batch.entity';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';

@Injectable()
export class BatchService {
  constructor(
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
  ) {}

  async create(createBatchDto: CreateBatchDto): Promise<Batch> {
    const lotNumber = await this.generateLotNumber();
    const batch = this.batchRepository.create({
      ...createBatchDto,
      lotNumber,
      manufacturingDate: new Date(createBatchDto.manufacturingDate),
      expiryDate: new Date(createBatchDto.expiryDate),
    });
    return this.batchRepository.save(batch);
  }

  async findAll(): Promise<Batch[]> {
    return this.batchRepository.find({ relations: ['product'] });
  }

  async findOne(id: string): Promise<Batch> {
    return this.batchRepository.findOne({
      where: { id },
      relations: ['product'],
    });
  }

  async findByLotNumber(lotNumber: string): Promise<Batch> {
    return this.batchRepository.findOne({
      where: { lotNumber },
      relations: ['product'],
    });
  }

  async findExpiring(days: number = 30): Promise<Batch[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    return this.batchRepository
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.product', 'product')
      .where('batch.expiryDate <= :expiryDate', { expiryDate })
      .orderBy('batch.expiryDate', 'ASC')
      .getMany();
  }

  async update(id: string, updateBatchDto: UpdateBatchDto): Promise<Batch> {
    await this.batchRepository.update(id, updateBatchDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.batchRepository.delete(id);
  }

  private async generateLotNumber(): Promise<string> {
    const prefix = 'LOT';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }
}
