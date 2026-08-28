import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateSupplierDto } from './create-supplier.dto';

/**
 * Status is omitted deliberately: it moves through
 * `PATCH /suppliers/:id/status`, which enforces the allowed transitions.
 * Allowing it here would let a general update bypass them.
 */
export class UpdateSupplierDto extends PartialType(
  OmitType(CreateSupplierDto, ['status'] as const),
) {}
