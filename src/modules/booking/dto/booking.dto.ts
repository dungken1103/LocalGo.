// src/modules/booking/dto/create-booking.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsDateString,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { BookingStatus } from '@prisma/client';

export class CreateBookingDto {
  @ApiProperty({ example: 'uuid-car-id' })
  @IsUUID()
  carId: string;

  @ApiProperty({ example: '2026-01-15' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-01-18' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 1000000, required: false })
  @IsString()
  slug?: string;
}

export class GetBookingDto {
  @ApiProperty({ example: 'booking-slug', required: false })
  @IsString()
  slug?: string;
}

// Admin get All Booking
export class AdminGetAllBookingDto {
  @ApiProperty({ example: '2026-01-01', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;
  @ApiProperty({ example: '2026-12-31', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

//renter getBooking
export class RenterGetBookingDto {
  @ApiProperty({
    example: 'ACTIVE',
    required: false,
    enum: BookingStatus,
    description: 'Filter bookings by status',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}

// Update Booking Status (for renter)
export class UpdateBookingStatusDto {
  @ApiProperty({ example: 'booking-slug' })
  @IsString()
  slug: string;

  @ApiProperty({
    example: 'ACTIVE',
    enum: BookingStatus,
    description: 'New status for the booking (ACTIVE or CANCELLED)',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(BookingStatus)
  status: BookingStatus;
}
