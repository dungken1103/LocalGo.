import { IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum BookingStatus {
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
}

export class CreateInvoiceDto {
  @ApiProperty({ example: 'uuid-booking-id' })
  @IsUUID()
  bookingId: string;

  @ApiProperty({ example: 'uuid-renter-id' })
  @IsUUID()
  renterId: string;

  @ApiProperty({ example: 'uuid-owner-id' })
  @IsUUID()
  ownerId: string;

  @ApiProperty({ example: 1000000 })
  @IsInt()
  @Min(1)
  amount: number;
}
