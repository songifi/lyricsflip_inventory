import {
    IsString,
    IsNumber,
    IsDate,
    IsOptional,
    IsObject,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateBatchDto {
    @IsString()
    batchNumber: string;

    @IsString()
    productId: string;

    @IsNumber()
    quantity: number;

    @Type(() => Date)
    @IsDate()
    manufacturingDate: Date;

    @Type(() => Date)
    @IsDate()
    expiryDate: Date;

    @IsNumber()
    @IsOptional()
    remainingQuantity?: number;

    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;
}
