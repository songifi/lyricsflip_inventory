import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'john@example.com', description: 'User email address' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'reset-token-123', description: 'Password reset token' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'newpassword123', description: 'New password', minLength: 6 })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldpassword123', description: 'Current password' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'newpassword123', description: 'New password', minLength: 6 })
  @IsString()
  @MinLength(6)
  newPassword: string;
} 