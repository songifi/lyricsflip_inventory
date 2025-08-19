import { Exclude, Expose } from "class-transformer";
import { UserStatus } from "../user.entity";

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Exclude()
  password: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  phoneNumber?: string;

  @Expose()
  avatar?: string;

  @Expose()
  bio?: string;

  @Expose()
  status: UserStatus;

  @Expose()
  lastLoginAt?: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
