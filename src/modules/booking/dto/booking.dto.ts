// src/modules/booking/dto/create-booking.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsOptional, IsString } from 'class-validator';

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
