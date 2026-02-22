import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ContractStatus } from '@prisma/client';

type ContractLookupInput = {
  contractId?: string;
  slug?: string;
};

/**
 * DTO for querying a contract
 * Either contractId or slug must be provided
 */
export class GetContractDto {
  @ApiPropertyOptional({
    description: 'Contract UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid contract ID format' })
  @ValidateIf((o: ContractLookupInput) => !o.slug)
  contractId?: string;

  @ApiPropertyOptional({
    description: 'Contract slug',
    example: 'contract-2026-01-12-abc123',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o: ContractLookupInput) => !o.contractId)
  slug?: string;
}

/**
 * DTO for contract owner/renter information
 */
export class ContractUserDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;
}

/**
 * DTO for car information in contract
 */
export class ContractCarDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'car-toyota-camry-2024' })
  slug: string;

  @ApiProperty({ example: 'Toyota' })
  brand: string;

  @ApiProperty({ example: 'Camry 2024' })
  name: string;

  @ApiProperty({ example: 'White' })
  color: string;

  @ApiProperty({
    example: 'SEDAN',
    enum: ['SEDAN', 'SUV', 'HATCHBACK', 'PICKUP', 'VAN'],
  })
  type: string;

  @ApiProperty({ example: 5 })
  seats: number;

  @ApiProperty({ example: 'SELF_DRIVE', enum: ['SELF_DRIVE', 'WITH_DRIVER'] })
  driveType: string;

  @ApiProperty({ example: 500000 })
  pricePerDay: number;
}

/**
 * DTO for booking information in contract
 */
export class ContractBookingDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiPropertyOptional({ example: 'booking-2026-01-12-xyz789' })
  slug?: string;

  @ApiProperty({ example: '2026-01-15T00:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ example: '2026-01-18T00:00:00.000Z' })
  endDate: Date;

  @ApiProperty({ example: 1500000 })
  totalPrice: number;

  @ApiProperty({
    example: 'ACTIVE',
    enum: [
      'PENDING_PAYMENT',
      'PENDING_CONFIRMATION',
      'ACTIVE',
      'COMPLETED',
      'CANCELLED',
    ],
  })
  status: string;

  @ApiProperty({ type: ContractCarDto })
  car: ContractCarDto;
}

/**
 * DTO for transaction information
 */
export class ContractTransactionDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 1500000 })
  amount: number;

  @ApiProperty({
    example: 'RENTAL_PENDING',
    enum: ['PAYIN', 'RENTAL_PENDING', 'RENTAL_RELEASE', 'WITHDRAW'],
  })
  type: string;

  @ApiProperty({ example: 'SUCCESS', enum: ['PENDING', 'SUCCESS', 'FAILED'] })
  status: string;

  @ApiProperty({ example: '2026-01-12T10:30:00.000Z' })
  createdAt: Date;

  @ApiPropertyOptional({ example: '2026-01-12T10:35:00.000Z' })
  confirmedAt?: Date;
}

/**
 * Main contract response DTO
 */
export class ContractResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiPropertyOptional({ example: 'contract-2026-01-12-abc123' })
  slug?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  bookingId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  renterId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  ownerId: string;

  @ApiProperty({ example: 1500000 })
  totalAmount: number;

  @ApiProperty({ example: 'PAID', enum: ContractStatus })
  status: ContractStatus;

  @ApiProperty({ type: ContractBookingDto })
  booking: ContractBookingDto;

  @ApiProperty({ type: ContractUserDto })
  renter: ContractUserDto;

  @ApiProperty({ type: ContractUserDto })
  owner: ContractUserDto;

  @ApiProperty({ type: [ContractTransactionDto] })
  transactions: ContractTransactionDto[];

  @ApiProperty({ example: '2026-01-12T10:00:00.000Z' })
  createdAt: Date;

  @ApiPropertyOptional({ example: '2026-01-12T10:30:00.000Z' })
  paidAt?: Date;
}

/**
 * API response wrapper for contract
 */
export class GetContractResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: ContractResponseDto })
  data: ContractResponseDto;

  @ApiPropertyOptional({ example: 'Contract retrieved successfully' })
  message?: string;
}
