import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  NotFoundException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import {
  ApplyOwnerDto,
  ReviewOwnerApplicationDto,
} from './dto/owner-application.dto';
import { UsersService } from './user.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  // ===== SPECIFIC ROUTES (must come before dynamic routes) =====
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

  // Owner Application Routes
  @Post('apply-owner')
  @UseGuards(JwtAuthGuard)
  async applyOwner(@Request() req, @Body() applyOwnerDto: ApplyOwnerDto) {
    return this.usersService.applyOwner(req.user.id, applyOwnerDto);
  }

  @Get('owner-applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllOwnerApplications() {
    return this.usersService.getAllOwnerApplications();
  }

  @Get('owner-applications/:applicationId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getOwnerApplicationById(@Param('applicationId') applicationId: string) {
    return this.usersService.getOwnerApplicationById(applicationId);
  }

  @Patch('owner-applications/:applicationId/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async approveOwnerApplication(@Param('applicationId') applicationId: string) {
    return this.usersService.approveOwnerApplication(applicationId);
  }

  @Patch('owner-applications/:applicationId/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async rejectOwnerApplication(
    @Param('applicationId') applicationId: string,
    @Body() reviewDto: ReviewOwnerApplicationDto,
  ) {
    return this.usersService.rejectOwnerApplication(applicationId, reviewDto);
  }
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
