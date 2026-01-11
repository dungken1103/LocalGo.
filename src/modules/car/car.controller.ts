import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { CarService } from './car.service';
import { CreateCarDto, UpdateCarDto } from './dto/car.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('cars')
@ApiBearerAuth()
@Controller('cars')
export class CarController {
  constructor(private carService: CarService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  async createCar(
    @Request() req: { user: { id: string; role: Role } },
    @Body() createCarDto: CreateCarDto,
  ) {
    const user = req.user;
    if (user.role !== Role.OWNER && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only OWNER or ADMIN can create cars');
    }

    return this.carService.createCar(user.id, createCarDto);
  }

  @Get()
  async getAllCars() {
    return this.carService.getAllCars();
  }

  @Get('my-cars')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  async getMyCars(@Request() req: { user: { id: string } }) {
    return this.carService.getCarsByOwner(req.user.id);
  }

  @Get(':slug')
  async getCarBySlug(@Param('slug') slug: string) {
    return this.carService.getCarBySlug(slug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  async updateCar(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() updateCarDto: UpdateCarDto,
  ) {
    return this.carService.updateCar(id, req.user.id, updateCarDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  async deleteCar(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.carService.deleteCar(id, req.user.id);
  }
}
