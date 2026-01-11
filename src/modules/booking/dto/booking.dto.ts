// src/modules/booking/dto/create-booking.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString } from 'class-validator';

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
