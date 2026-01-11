import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCarDto, UpdateCarDto } from './dto/car.dto';
import { generateSlug } from '../../ultils/slug.util';

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
}
