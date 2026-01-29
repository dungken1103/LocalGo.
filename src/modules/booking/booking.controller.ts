// src/modules/booking/booking.controller.ts
import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Query,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { BookingService } from './booking.service';
import {
  CreateBookingDto,
  GetBookingDto,
  RenterGetBookingDto,
  UpdateBookingStatusDto,
} from './dto/booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BookingStatus } from './dto/booking.enum';

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

  @UseGuards(JwtAuthGuard)
  @Get('renter')
  @ApiOperation({
    summary: 'Renter get bookings',
    description:
      'Get all bookings for logged in renter, optionally filtered by status',
  })
  renterGetBooking(@Req() req, @Query() dto: RenterGetBookingDto) {
    return this.bookingService.getBookingByRenter(req.user.userId, dto);
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get bookings',
    description: 'Get all bookings, optionally filtered by status',
  })
  getBookings(@Query('status') status: BookingStatus) {
    return this.bookingService.getAllBookingByStatus(status);
  }

  @Get('admin')
  @ApiOperation({ summary: 'Admin get all bookings' })
  adminGetAllBooking() {
    return this.bookingService.getAllBookingAdmin();
  }

  @UseGuards(JwtAuthGuard)
  @Get('owner')
  @ApiOperation({ summary: 'Owner get bookings' })
  ownerGetBooking(@Req() req) {
    return this.bookingService.getBookingByOwner(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-status')
  @ApiOperation({
    summary: 'Update booking status (Renter only)',
    description:
      'Renter can change booking status from PENDING_CONFIRMATION to ACTIVE or CANCELLED',
  })
  updateBookingStatus(@Req() req, @Body() dto: UpdateBookingStatusDto) {
    return this.bookingService.updateBookingStatus(
      req.user.userId,
      dto.slug,
      dto.status,
    );
  }
}
