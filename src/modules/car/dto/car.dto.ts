import { IsString, IsInt, IsEnum, IsOptional, Min } from 'class-validator';
import { CarType, DriveType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCarDto {
  @ApiProperty({ example: 'Toyota', description: 'Car brand' })
  @IsString()
  brand: string;

  @ApiProperty({ example: 'Camry', description: 'Car model name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'White', description: 'Car color' })
  @IsString()
  color: string;

  @ApiProperty({ example: 'SEDAN', enum: CarType, description: 'Type of car' })
  @IsEnum(CarType)
  type: CarType;

  @ApiProperty({ example: 5, description: 'Number of seats' })
  @IsInt()
  @Min(1)
  seats: number;

  @ApiProperty({
    example: 'SELF_DRIVE',
    enum: DriveType,
    description: 'Drive type',
  })
  @IsEnum(DriveType)
  driveType: DriveType;

  @ApiProperty({ example: 500000, description: 'Price per day in VND' })
  @IsInt()
  @Min(0)
  pricePerDay: number;

  @ApiProperty({
    example: 'Comfortable sedan, perfect for city travel',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCarDto {
  @ApiProperty({ example: 'Toyota', required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ example: 'Camry', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'White', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: 'SEDAN', enum: CarType, required: false })
  @IsOptional()
  @IsEnum(CarType)
  type?: CarType;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  seats?: number;

  @ApiProperty({ example: 'SELF_DRIVE', enum: DriveType, required: false })
  @IsOptional()
  @IsEnum(DriveType)
  driveType?: DriveType;

  @ApiProperty({ example: 500000, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  pricePerDay?: number;

  @ApiProperty({
    example: 'Comfortable sedan, perfect for city travel',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
