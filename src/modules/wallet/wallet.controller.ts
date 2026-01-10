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
import { DepositRequestDTO } from '../auth/dto/deposit-request.dto';
import { PrismaService } from '../../database/prisma.service';

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
  async createDepositRequest(@Body() body: any) {
    const { userId, amount, sepayOrderId } = body;

    if (!userId || !amount || !sepayOrderId) {
      throw new Error('Missing required fields');
    }

    return this.walletService.createPayin(userId, amount, sepayOrderId);
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
}
