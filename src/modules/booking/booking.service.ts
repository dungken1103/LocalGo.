// src/modules/booking/booking.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BookingStatus, ContractStatus } from '@prisma/client';
import { GetBookingDto } from './dto/booking.dto';

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
  // get booking by slug
  async getBooking(dto: GetBookingDto) {
    if ( !dto.slug) {
      throw new BadRequestException('Booking slug must be provided');
    }

    const booking = await this.prisma.booking.findFirst({
      where: {
        OR: [dto.slug ? { slug: dto.slug } : {}].filter(
          (condition) => Object.keys(condition).length > 0,
        ),
      },
      include: {
        car: {
          select: {
            id: true,
            slug: true,
            brand: true,
            name: true,
            color: true,
            type: true,
            seats: true,
            driveType: true,
            pricePerDay: true,
            description: true,
          },
        },
        renter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        contract: {
          select: {
            id: true,
            slug: true,
            totalAmount: true,
            status: true,
            createdAt: true,
            paidAt: true,
          },
        },
        transactions: {
          select: {
            id: true,
            amount: true,
            type: true,
            status: true,
            createdAt: true,
            confirmedAt: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return {
      success: true,
      data: booking,
    };
  }
  async getAllBookingAdmin() {
    const bookings = await this.prisma.booking.findMany({
      include: {
        car: true,
        renter: true,
        owner: true,
        contract: true,
        transactions: true,
      },
    });

    return {
      success: true,
      data: bookings,
    };
  }
}
