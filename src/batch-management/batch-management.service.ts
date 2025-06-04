import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan } from "typeorm";
import { Batch } from "./entities/batch.entity";
import { CreateBatchDto } from "./dto/create-batch.dto";
import { UpdateBatchDto } from "./dto/update-batch.dto";

@Injectable()
export class BatchManagementService {
    constructor(
        @InjectRepository(Batch)
        private batchRepository: Repository<Batch>
    ) {}

    async create(createBatchDto: CreateBatchDto): Promise<Batch> {
        const batch = this.batchRepository.create(createBatchDto);
        return await this.batchRepository.save(batch);
    }

    async findAll(): Promise<Batch[]> {
        return await this.batchRepository.find({
            relations: ["product"],
            order: { expiryDate: "ASC" }, // FEFO ordering
        });
    }

    async findOne(id: string): Promise<Batch> {
        const batch = await this.batchRepository.findOne({
            where: { id },
            relations: ["product"],
        });
        if (!batch) {
            throw new NotFoundException(`Batch with ID ${id} not found`);
        }
        return batch;
    }

    async update(id: string, updateBatchDto: UpdateBatchDto): Promise<Batch> {
        const batch = await this.findOne(id);
        Object.assign(batch, updateBatchDto);
        return await this.batchRepository.save(batch);
    }

    async remove(id: string): Promise<void> {
        const result = await this.batchRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Batch with ID ${id} not found`);
        }
    }

    async getExpiringBatches(daysThreshold: number): Promise<Batch[]> {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + daysThreshold);

        return await this.batchRepository.find({
            where: {
                expiryDate: LessThan(expiryDate),
                isExpired: false,
            },
            relations: ["product"],
            order: { expiryDate: "ASC" },
        });
    }

    async getExpiredBatches(): Promise<Batch[]> {
        const today = new Date();
        return await this.batchRepository.find({
            where: {
                expiryDate: LessThan(today),
                isExpired: false,
            },
            relations: ["product"],
        });
    }

    async markBatchAsExpired(id: string): Promise<Batch> {
        const batch = await this.findOne(id);
        batch.isExpired = true;
        return await this.batchRepository.save(batch);
    }

    async getBatchesByProduct(productId: string): Promise<Batch[]> {
        return await this.batchRepository.find({
            where: { productId },
            order: { expiryDate: "ASC" },
        });
    }

    async updateRemainingQuantity(
        id: string,
        quantity: number
    ): Promise<Batch> {
        const batch = await this.findOne(id);
        batch.remainingQuantity = quantity;
        return await this.batchRepository.save(batch);
    }
}
