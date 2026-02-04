import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import {
  ApplyOwnerDto,
  ReviewOwnerApplicationDto,
} from './dto/owner-application.dto';
import * as bcrypt from 'bcrypt';
import slugify from 'slugify';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;
    const passwordHash = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        ...rest,
        slug: slugify(rest.name, { lower: true }),
        passwordHash,
      },
    });
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
    });
  }

  async applyOwner(userId: string, applyOwnerDto: ApplyOwnerDto) {
    // Kiểm tra user có tồn tại không
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Kiểm tra xem user đã có application pending không
    const existingApplication = await this.prisma.ownerApplication.findFirst({
      where: {
        userId,
        status: 'PENDING',
      },
    });

    if (existingApplication) {
      throw new Error('You already have a pending owner application');
    }

    // Tạo owner application mới
    return this.prisma.ownerApplication.create({
      data: {
        ...applyOwnerDto,
        userId,
        slug: slugify(`${user.name}-${Date.now()}`, { lower: true }),
      },
    });
  }

  async getAllOwnerApplications() {
    return this.prisma.ownerApplication.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getOwnerApplicationById(applicationId: string) {
    const application = await this.prisma.ownerApplication.findUnique({
      where: { id: applicationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Owner application not found');
    }

    return application;
  }

  async approveOwnerApplication(applicationId: string) {
    const application = await this.prisma.ownerApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Owner application not found');
    }

    if (application.status !== 'PENDING') {
      throw new Error('This application has already been reviewed');
    }

    // Cập nhật application status và user role + thông tin
    const [updatedApplication] = await this.prisma.$transaction([
      this.prisma.ownerApplication.update({
        where: { id: applicationId },
        data: {
          status: 'APPROVED',
        },
      }),
      this.prisma.user.update({
        where: { id: application.userId },
        data: {
          role: 'OWNER',
          phone: application.phone,
          bankAccount: application.bankAccount,
          bankName: application.bankName,
          avatar: application.avatar || undefined,
        },
      }),
    ]);

    return updatedApplication;
  }

  async rejectOwnerApplication(
    applicationId: string,
    reviewDto: ReviewOwnerApplicationDto,
  ) {
    const application = await this.prisma.ownerApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Owner application not found');
    }

    if (application.status !== 'PENDING') {
      throw new Error('This application has already been reviewed');
    }

    return this.prisma.ownerApplication.update({
      where: { id: applicationId },
      data: {
        status: 'REJECTED',
        rejectionReason: reviewDto.rejectionReason,
      },
    });
  }
}
