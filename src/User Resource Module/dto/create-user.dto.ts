import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ example: "john_doe", description: "Unique username" })
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @ApiProperty({
    example: "john@example.com",
    description: "User email address",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "password123",
    description: "User password (min 8 characters)",
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: "John", description: "User first name" })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: "Doe", description: "User last name" })
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({
    example: "+1234567890",
    description: "User phone number",
  })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: "https://example.com/avatar.jpg",
    description: "User avatar URL",
  })
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    example: "Software developer passionate about technology",
    description: "User bio",
  })
  @IsOptional()
  bio?: string;
}
