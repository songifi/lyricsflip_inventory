import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePharmacyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  location: string;
}
