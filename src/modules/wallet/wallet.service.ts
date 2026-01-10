import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { TransactionStatus, TransactionType } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getWalletBalanceByUserId(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      select: {
        availableBalance: true,
        pendingBalance: true,
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async createPayin(userId: string, amount: number, sepayOrderId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    if (!wallet) throw new Error('Wallet not found');

    await this.prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        amount,
        type: TransactionType.PAYIN,
        status: TransactionStatus.PENDING,
        sepayOrderId,
      },
    });
  }

  @Cron('*/30 * * * * *')
  async checkPendingTransactions() {
    const txs = await this.prisma.walletTransaction.findMany({
      where: { status: TransactionStatus.PENDING },
    });

    for (const t of txs) {
      const matched = await this.checkWithSepayAPI(t.sepayOrderId!, t.amount);

      if (!matched) continue;

      await this.prisma.$transaction([
        this.prisma.walletTransaction.update({
          where: { id: t.id },
          data: {
            status: TransactionStatus.SUCCESS,
            confirmedAt: new Date(),
          },
        }),
        this.prisma.wallet.update({
          where: { id: t.walletId },
          data: {
            availableBalance: { increment: t.amount },
          },
        }),
      ]);
    }
  }

  async checkWithSepayAPI(
    sepayOrderId: string,
    amount: number,
  ): Promise<boolean> {
    const url = 'https://my.sepay.vn/userapi/transactions/list';

    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer YOUR_SEPAY_TOKEN`,
      },
    });

    return res.data.transactions?.some(
      (txn) =>
        txn.transaction_content?.includes(sepayOrderId) &&
        Math.round(Number(txn.amount_in)) === amount,
    );
  }
  async payin(userId: string, amount: number) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    if (!wallet) throw new Error('Wallet not found');

    await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        availableBalance: { increment: amount },
      },
    });
  }
}
