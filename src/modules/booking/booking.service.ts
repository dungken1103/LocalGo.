// src/modules/booking/booking.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BookingStatus, ContractStatus } from '@prisma/client';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async createBooking(
    renterId: string,
    dto: {
      carId: string;
      startDate: string;
      endDate: string;
    },
  ) {
    const car = await this.prisma.car.findUnique({
      where: { id: dto.carId },
    });

    if (!car) throw new BadRequestException('Car not found');

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (start >= end) {
      throw new BadRequestException('Invalid rental period');
    }

    const days =
      Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      ) || 1;

    const totalPrice = days * car.pricePerDay;

    // 🔥 Transaction tạo booking + contract
    const result = await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          carId: car.id,
          renterId,
          ownerId: car.ownerId,
          startDate: start,
          endDate: end,
          totalPrice,
          status: BookingStatus.PENDING_PAYMENT,
        },
      });

      return { booking };
    });

    return result;
  }
}
