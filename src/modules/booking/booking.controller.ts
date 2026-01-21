// src/modules/booking/booking.controller.ts
import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateBookingDto, GetBookingDto } from './dto/booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Booking')
@ApiBearerAuth()
@Controller('booking')
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  createBooking(@Req() req, @Body() dto: CreateBookingDto) {
    console.log(req.user.userId);
    return this.bookingService.createBooking(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get booking by ID or slug' })
  getBooking(@Query() dto: GetBookingDto) {
    return this.bookingService.getBooking(dto);
  }
}
