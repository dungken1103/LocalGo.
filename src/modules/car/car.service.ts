import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateCarDto, UpdateCarDto } from './dto/car.dto';
import { generateSlug } from '../../ultils/slug.util';

type CarSortField =
  | 'brand'
  | 'name'
  | 'year'
  | 'seats'
  | 'pricePerDay'
  | 'createdAt';

const CAR_SORT_FIELDS: readonly CarSortField[] = [
  'brand',
  'name',
  'year',
  'seats',
  'pricePerDay',
  'createdAt',
];

@Injectable()
export class CarService {
  constructor(private prisma: PrismaService) {}

  async createCar(ownerId: string, createCarDto: CreateCarDto) {
    const slug = generateSlug(`${createCarDto.brand} ${createCarDto.name}`);

    const car = await this.prisma.car.create({
      data: {
        ...createCarDto,
        slug,
        ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return car;
  }

  async searchCars(
    filters: {
      make?: string;
      model?: string;
      seats?: number;
      priceMin?: number;
      priceMax?: number;
    },
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
    page: number = 1,
    limit: number = 10,
  ) {
    const where: Prisma.CarWhereInput = {};

    if (filters.make) {
      where.brand = { contains: filters.make, mode: 'insensitive' };
    }
    if (filters.model) {
      where.name = { contains: filters.model, mode: 'insensitive' };
    }
    if (filters.seats) {
      where.seats = filters.seats;
    }
    if (filters.priceMin || filters.priceMax) {
      const pricePerDayFilter: Prisma.IntFilter = {};
      if (filters.priceMin) {
        pricePerDayFilter.gte = filters.priceMin;
      }
      if (filters.priceMax) {
        pricePerDayFilter.lte = filters.priceMax;
      }
      where.pricePerDay = pricePerDayFilter;
    }

    let orderBy: Prisma.CarOrderByWithRelationInput | undefined;
    if (sortBy && CAR_SORT_FIELDS.includes(sortBy as CarSortField)) {
      const validatedSortBy = sortBy as CarSortField;
      orderBy = { [validatedSortBy]: sortOrder };
    }

    const cars = await this.prisma.car.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return cars;
  }

  async getAllCars() {
    return this.prisma.car.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getCarById(id: string) {
    const car = await this.prisma.car.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    return car;
  }

  async getCarBySlug(slug: string) {
    const car = await this.prisma.car.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    return car;
  }

  async getCarsByOwner(ownerId: string) {
    return this.prisma.car.findMany({
      where: { ownerId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async updateCar(id: string, ownerId: string, updateCarDto: UpdateCarDto) {
    const car = await this.prisma.car.findUnique({
      where: { id },
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    if (car.ownerId !== ownerId) {
      throw new ForbiddenException('You can only update your own cars');
    }

    const updatedCar = await this.prisma.car.update({
      where: { id },
      data: updateCarDto,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedCar;
  }

  async updateCarBySlug(
    slug: string,
    ownerId: string,
    updateCarDto: UpdateCarDto,
  ) {
    const car = await this.prisma.car.findUnique({
      where: { slug },
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    if (car.ownerId !== ownerId) {
      throw new ForbiddenException('You can only update your own cars');
    }

    const updatedCar = await this.prisma.car.update({
      where: { slug },
      data: updateCarDto,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedCar;
  }

  async deleteCar(id: string, ownerId: string) {
    const car = await this.prisma.car.findUnique({
      where: { id },
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    if (car.ownerId !== ownerId) {
      throw new ForbiddenException('You can only delete your own cars');
    }

    await this.prisma.car.delete({
      where: { id },
    });

    return { message: 'Car deleted successfully' };
  }

  async deleteCarBySlug(slug: string, ownerId: string) {
    const car = await this.prisma.car.findUnique({
      where: { slug },
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    if (car.ownerId !== ownerId) {
      throw new ForbiddenException('You can only delete your own cars');
    }

    await this.prisma.car.delete({
      where: { slug },
    });

    return { message: 'Car deleted successfully' };
  }

  async checkAvailability(carId: string, startDate: string, endDate: string) {
    console.log('\n=== CHECK AVAILABILITY ===');
    console.log('Car ID:', carId);
    console.log('Start Date (raw):', startDate);
    console.log('End Date (raw):', endDate);

    const car = await this.prisma.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    // Kiểm tra nếu thiếu thông tin ngày
    if (
      !startDate ||
      !endDate ||
      startDate.trim() === '' ||
      endDate.trim() === ''
    ) {
      return {
        isAvailable: car.status === 'AVAILABLE',
        conflictingBookings: 0,
        carStatus: car.status,
        message: 'Vui lòng chọn ngày nhận và trả xe để kiểm tra tình trạng',
      };
    }

    // Validate và parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    console.log('Start Date (parsed):', start);
    console.log('End Date (parsed):', end);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        isAvailable: false,
        conflictingBookings: 0,
        carStatus: car.status,
        message: 'Định dạng ngày không hợp lệ. Vui lòng chọn lại.',
      };
    }

    if (start >= end) {
      return {
        isAvailable: false,
        conflictingBookings: 0,
        carStatus: car.status,
        message: 'Ngày nhận xe phải trước ngày trả xe.',
      };
    }

    // Kiểm tra các booking trùng lịch
    // Logic: Booking conflict nếu startDate < end và endDate > start
    const conflictingBookings = await this.prisma.booking.findMany({
      where: {
        carId,
        status: {
          in: ['PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'ACTIVE'],
        },
        AND: [
          {
            startDate: {
              lt: end, // Booking bắt đầu trước khi kết thúc
            },
          },
          {
            endDate: {
              gt: start, // Booking kết thúc sau khi bắt đầu
            },
          },
        ],
      },
    });

    console.log('Conflicting bookings found:', conflictingBookings.length);
    if (conflictingBookings.length > 0) {
      console.log(
        'Conflicting bookings:',
        conflictingBookings.map((b) => ({
          id: b.id,
          startDate: b.startDate,
          endDate: b.endDate,
          status: b.status,
        })),
      );
    }

    const isAvailable =
      conflictingBookings.length === 0 && car.status === 'AVAILABLE';

    console.log('Is Available:', isAvailable);
    console.log('=== END CHECK AVAILABILITY ===\n');

    return {
      isAvailable,
      conflictingBookings: conflictingBookings.length,
      carStatus: car.status,
      message: !isAvailable
        ? car.status !== 'AVAILABLE'
          ? `Xe hiện đang ở trạng thái ${car.status}`
          : 'Xe đã có lịch thuê trong khoảng thời gian này'
        : 'Xe sẵn sàng cho thuê',
    };
  }

  async checkAvailabilityBySlug(
    slug: string,
    startDate: string,
    endDate: string,
  ) {
    const car = await this.prisma.car.findUnique({
      where: { slug },
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    return this.checkAvailability(car.id, startDate, endDate);
  }
}
