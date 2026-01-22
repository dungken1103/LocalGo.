// src/modules/booking/booking.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BookingStatus, ContractStatus } from '@prisma/client';
import { GetBookingDto, RenterGetBookingDto } from './dto/booking.dto';

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
      const slug = `booking-${Math.random().toString(36).substring(2, 8)}`;
      const booking = await tx.booking.create({
        data: {
          carId: car.id,
          renterId,
          ownerId: car.ownerId,
          startDate: start,
          endDate: end,
          totalPrice,
          status: BookingStatus.PENDING_PAYMENT,
          slug,
        },
      });

      return booking ;
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
  // renter get booking ordered by date
  async getBookingByRenter(renterId: string, dto: RenterGetBookingDto) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        renterId: renterId,
        ...(dto.status && { status: dto.status as BookingStatus }),
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
            pricePerDay: true,
            image: true,
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
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return {
      success: true,
      data: bookings,
    };
  }

  // Update booking status (renter can change from PENDING_CONFIRMATION to ACTIVE or CANCELLED)
  async updateBookingStatus(
    renterId: string,
    slug: string,
    newStatus: BookingStatus,
  ) {
    // Find booking and verify ownership
    const booking = await this.prisma.booking.findUnique({
      where: { slug },
      include: {
        car: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check if user is the renter
    if (booking.renterId !== renterId) {
      throw new BadRequestException('You are not authorized to update this booking');
    }

    // Check if current status is PENDING_CONFIRMATION
    if (booking.status !== BookingStatus.PENDING_CONFIRMATION) {
      throw new BadRequestException(
        `Cannot update booking. Current status is ${booking.status}. Only bookings with PENDING_CONFIRMATION status can be updated.`,
      );
    }

    // Validate new status
    if (newStatus !== BookingStatus.ACTIVE && newStatus !== BookingStatus.CANCELLED) {
      throw new BadRequestException('Invalid status. Only ACTIVE or CANCELLED are allowed.');
    }

    // Update booking status
    const updatedBooking = await this.prisma.booking.update({
      where: { slug },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
      include: {
        car: {
          select: {
            id: true,
            slug: true,
            brand: true,
            name: true,
            pricePerDay: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        contract: true,
      },
    });

    return {
      success: true,
      message: `Booking status updated to ${newStatus}`,
      data: updatedBooking,
    };
  }
}
