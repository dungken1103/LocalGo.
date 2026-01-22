import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { TransactionStatus, TransactionType } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { ContractStatus } from '@prisma/client';
import { Contract } from './dto/contract.dto';

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

  async createPayin(
    userId: string,
    amount: number,
    sepayOrderId: string,
    bookingId?: string,
  ) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    if (!wallet) throw new Error('Wallet not found');

    const tx = await this.prisma.walletTransaction.create({
      data: {
        amount,
        type: TransactionType.RENTAL_PENDING,
        status: TransactionStatus.PENDING,
        sepayOrderId,

        walletId: wallet.id,
        bookingId: bookingId ?? null,
      },
    });

    return {
      transactionId: tx.id,
      sepayOrderId: tx.sepayOrderId,
      amount: tx.amount,
      status: tx.status,
    };
  }

  @Cron('0 0 * * *')
  async checkPendingPayinTransactions() {
    const txs = await this.prisma.walletTransaction.findMany({
      where: {
        status: TransactionStatus.PENDING,
        type: TransactionType.RENTAL_PENDING,
        sepayOrderId: { not: null },
      },
    });

    for (const t of txs) {
      const matched = await this.checkWithSepayAPI(t.sepayOrderId!, t.amount);
      if (!matched) continue;

      // 🔒 ATOMIC UPDATE (CHỐT)
      const updated = await this.prisma.walletTransaction.updateMany({
        where: {
          id: t.id,
          status: TransactionStatus.PENDING,
        },
        data: {
          status: TransactionStatus.SUCCESS,
          confirmedAt: new Date(),
        },
      });

      // ❗ nếu không update được → đã xử lý rồi
      if (updated.count === 0) continue;

      await this.prisma.wallet.update({
        where: { id: t.walletId },
        data: {
          pendingBalance: { increment: t.amount * 0.9 },
        },
      });
    }
  }

  async confirmCarDelivery(bookingId: string, ownerId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      // include: { contract: true },
    });

    if (!booking || booking.ownerId !== ownerId) {
      throw new Error('Unauthorized');
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { userId: ownerId },
    });

    const amount = Math.floor(booking.totalPrice * 0.9);

    await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: wallet!.id },
        data: {
          pendingBalance: { decrement: amount },
          availableBalance: { increment: amount },
        },
      }),

      this.prisma.walletTransaction.create({
        data: {
          walletId: wallet!.id,
          amount,
          type: TransactionType.RENTAL_RELEASE,
          status: TransactionStatus.SUCCESS,
          bookingId,
        },
      }),

      this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.ACTIVE },
      }),
    ]);
  }

  async checkWithSepayAPI(
    sepayOrderId: string,
    amount: number,
  ): Promise<boolean> {
    const url = 'https://my.sepay.vn/userapi/transactions/list';

    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.SEPAY_TOKEN}`,
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

  async createInvoice(
    bookingId: string,
    renterId: string,
    ownerId: string,
    amount: number,
  ) {
    const renterWallet = await this.prisma.wallet.findUnique({
      where: { userId: renterId },
    });
    if (!renterWallet) throw new Error('Renter wallet not found');

    const ownerWallet = await this.prisma.wallet.findUnique({
      where: { userId: ownerId },
    });
    if (!ownerWallet) throw new Error('Owner wallet not found');

    const invoice = await this.prisma.contract.create({
      data: {
        bookingId,
        renterId,
        ownerId,
        totalAmount: amount,
        status: ContractStatus.PENDING,
      },
    });

    return invoice;
  }

  async cancelInvoice(invoiceId: string) {
    const invoice = await this.prisma.contract.findUnique({
      where: { id: invoiceId },
    });
    if (!invoice) throw new Error('Invoice not found');

    if (invoice.status !== 'PENDING') {
      throw new Error('Only pending invoices can be canceled');
    }

    await this.prisma.contract.update({
      where: { id: invoiceId },
      data: { status: ContractStatus.CANCELLED },
    });
  }

  async payInvoice(invoiceId: string) {
    const invoice = await this.prisma.contract.findUnique({
      where: { id: invoiceId },
    });
    if (!invoice) throw new Error('Invoice not found');

    if (invoice.status !== 'PENDING') {
      throw new Error('Only pending invoices can be paid');
    }

    // Simulate payment via Sepay
    const paymentSuccess = true; // Replace with actual payment logic

    if (paymentSuccess) {
      await this.prisma.$transaction([
        this.prisma.contract.update({
          where: { id: invoiceId },
          data: { status: 'PAID' },
        }),
        this.prisma.wallet.update({
          where: { userId: invoice.ownerId },
          data: {
            pendingBalance: { increment: invoice.totalAmount * 0.9 },
          },
        }),
      ]);
    } else {
      throw new Error('Payment failed');
    }
  }

  async confirmInvoice(invoiceId: string) {
    const invoice = await this.prisma.contract.findUnique({
      where: { id: invoiceId },
    });
    if (!invoice) throw new Error('Invoice not found');

    if (invoice.status !== 'PAID') {
      throw new Error('Only paid invoices can be confirmed');
    }

    await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { userId: invoice.ownerId },
        data: {
          pendingBalance: { decrement: invoice.totalAmount * 0.9 },
          availableBalance: { increment: invoice.totalAmount * 0.9 },
        },
      }),
      this.prisma.contract.update({
        where: { id: invoiceId },
        data: { status: ContractStatus.PAID },
      }),
    ]);
  }
}
