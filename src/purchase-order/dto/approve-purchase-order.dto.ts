import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApprovePurchaseOrderDto {
  @ApiProperty({ description: 'Whether to approve or reject the order' })
  @IsBoolean()
  approved: boolean;

  @ApiProperty({ description: 'Person approving/rejecting the order' })
  @IsString()
  approvedBy: string;

  @ApiPropertyOptional({ description: 'Reason for rejection (required if approved = false)' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
} 