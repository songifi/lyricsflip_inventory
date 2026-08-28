import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import {
  CommunicationChannel,
  CommunicationDirection,
} from '../entities/supplier-communication-log.entity';

export class CreateSupplierCommunicationDto {
  @IsEnum(CommunicationChannel)
  channel: CommunicationChannel;

  @IsEnum(CommunicationDirection)
  direction: CommunicationDirection;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsUUID()
  @IsOptional()
  contactId?: string;

  /** Defaults to now. Set it when logging an exchange after the fact. */
  @IsDateString()
  @IsOptional()
  occurredAt?: string;
}
