import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UsersService } from './user.service';
import { PrismaService } from '../../database/prisma.service';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  @Get(':userId')
  async getUserById(@Param('userId') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId: user.id },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      wallet: {
        available: wallet?.availableBalance ?? 0,
        pending: wallet?.pendingBalance ?? 0,
      },
    };
  }

  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(userId, updateUserDto);
  }
}
