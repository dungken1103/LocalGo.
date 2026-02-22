import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { PrismaService } from '../../database/prisma.service';
import { CreateInvoiceDto } from './dto/wallet.dto';
import { BadRequestException } from '@nestjs/common';

type CreateDepositBody = {
  userId?: string;
  amount?: number;
  sepayOrderId?: string;
  bookingId?: string;
};

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('get')
  async getWallet(@Query('userId') userId: string) {
    console.log('hihi:', userId);
    const wallet = await this.walletService.getWalletBalanceByUserId(userId);
    return wallet;
  }

  @Post('handle')
  async createDepositRequest(@Body() body: CreateDepositBody) {
    console.log('BODY:', body);
    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException('Body is required');
    }

    const { userId, amount, sepayOrderId, bookingId } = body;

    if (!userId || !amount || !sepayOrderId) {
      throw new BadRequestException('Missing required fields');
    }

    return this.walletService.createPayin(
      userId,
      amount,
      sepayOrderId,
      bookingId,
    );
  }

  @Get('user/:userId')
  async getUserTransactions(@Param('userId') userId: string) {
    console.log(userId);
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found for this user');
    }

    const transactions = await this.prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
    });

    return transactions;
  }

  @Post('invoice/create')
  async createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.walletService.createInvoice(
      dto.bookingId,
      dto.renterId,
      dto.ownerId,
      dto.amount,
    );
  }

  @Post('invoice/cancel')
  async cancelInvoice(@Body('invoiceId') invoiceId: string) {
    if (!invoiceId) {
      throw new Error('Missing invoiceId');
    }

    return this.walletService.cancelInvoice(invoiceId);
  }

  @Post('invoice/pay')
  async payInvoice(@Body('invoiceId') invoiceId: string) {
    if (!invoiceId) {
      throw new Error('Missing invoiceId');
    }

    return this.walletService.payInvoice(invoiceId);
  }

  @Post('invoice/confirm')
  async confirmInvoice(@Body('invoiceId') invoiceId: string) {
    if (!invoiceId) {
      throw new Error('Missing invoiceId');
    }

    return this.walletService.confirmInvoice(invoiceId);
  }

  @Get('transaction/:sepayOrderId')
  async checkTransaction(@Param('sepayOrderId') id: string) {
    const tx = await this.prisma.walletTransaction.findFirst({
      where: { sepayOrderId: id },
      select: {
        status: true,
        amount: true,
        confirmedAt: true,
      },
    });

    if (!tx) throw new NotFoundException('Transaction not found');

    return tx;
  }
}
