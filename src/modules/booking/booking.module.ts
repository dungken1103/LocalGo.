import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { PrismaService } from '../../database/prisma.service';
import { WalletService } from '../wallet/wallet.service';

@Module({
  controllers: [BookingController],
  providers: [BookingService, PrismaService, WalletService],
})
export class BookingModule {}
