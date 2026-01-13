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
} from '@nestjs/common';
import { CarService } from './car.service';
import { CreateCarDto, UpdateCarDto } from './dto/car.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@ApiTags('cars')
@ApiBearerAuth()
@Controller('cars')
export class CarController {
  constructor(
    private carService: CarService,
    private cloudinaryService: CloudinaryService,
  ) {}

  private ensureTmpFolder() {
    const tmpDir = path.join(process.cwd(), 'tmp'); // luu trong root project, cả src và dist đều dùng được
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    return tmpDir;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) =>
          cb(null, path.join(process.cwd(), 'tmp')),
        filename: (req, file, cb) =>
          cb(null, `${uuidv4()}-${file.originalname}`),
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async createCar(
    @Request() req: { user: { id: string } },
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any, // 👈 đổi từ CreateCarDto sang any
  ) {
    // Convert string -> number manually
    const createCarDto: CreateCarDto = {
      ...body,
      seats: Number(body.seats),
      pricePerDay: Number(body.pricePerDay),
    };

    // Xử lý ảnh
    let imageUrl: string | undefined;
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file.path);
      imageUrl = result.secure_url;
      fs.unlinkSync(file.path);
    }

    return this.carService.createCar(req.user.id, {
      ...createCarDto,
      image: imageUrl,
    });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) =>
          cb(null, path.join(process.cwd(), 'tmp')),
        filename: (req, file, cb) =>
          cb(null, `${uuidv4()}-${file.originalname}`),
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async updateCar(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any, // đổi từ UpdateCarDto sang any
  ) {
    this.ensureTmpFolder();

    // Convert các trường number nếu có
    const updateCarDto: UpdateCarDto = {
      ...body,
      ...(body.seats !== undefined && { seats: Number(body.seats) }),
      ...(body.pricePerDay !== undefined && {
        pricePerDay: Number(body.pricePerDay),
      }),
    };

    let imageUrl: string | undefined;

    if (file) {
      try {
        const result = await this.cloudinaryService.uploadImage(file.path);
        imageUrl = result.secure_url;
      } catch (err) {
        console.error('Cloudinary upload failed:', err);
        throw new Error('Image upload failed');
      } finally {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
    }

    return this.carService.updateCar(id, req.user.id, {
      ...updateCarDto,
      ...(imageUrl && { image: imageUrl }),
    });
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
