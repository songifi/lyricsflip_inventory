import { IsOptional, IsEnum, IsInt, Min, Max } from "class-validator";
import { Transform, Type } from "class-transformer";
import { UserStatus } from "../user.entity";

export class UserQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  search?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @Transform(({ value }) => value?.split(","))
  sortBy?: string[];

  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  sortOrder?: "asc" | "desc" = "asc";
}
