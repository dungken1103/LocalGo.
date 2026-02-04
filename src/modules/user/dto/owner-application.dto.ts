import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export enum OwnerApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class ApplyOwnerDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => String(value))
  phone: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => String(value))
  bankAccount: string;

  @IsOptional()
  @IsString()
  bankName?: string;
}

export class ReviewOwnerApplicationDto {
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
