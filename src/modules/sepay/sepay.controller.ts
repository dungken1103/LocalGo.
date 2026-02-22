import { Controller, Post, Body } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TransactionStatus, TransactionType } from '@prisma/client';
import { HttpCode } from '@nestjs/common/decorators';
import { BookingStatus } from '../booking/dto/booking.enum';

type SepayWebhookPayload = {
  content?: string;
  transferType?: string;
  transferAmount?: number;
};

@Controller('sepay')
export class SepayController {
  constructor(private prisma: PrismaService) {}

  // @Post('webhook')
  // async handleWebhook(@Body() body: any) {
  //   if (!body) return { ok: true };

  //   const { amount, content, status } = body;
  //   if (!content || !amount || status !== 'SUCCESS') return { ok: true };

  //   const tx = await this.prisma.walletTransaction.findFirst({
  //     where: {
  //       sepayOrderId: content,
  //       type: TransactionType.RENTAL_PENDING,
  //     },
  //   });

  //   if (!tx) return { ok: true };

  //   // 🔒 ATOMIC UPDATE
  //   const updated = await this.prisma.walletTransaction.updateMany({
  //     where: {
  //       id: tx.id,
  //       status: TransactionStatus.PENDING,
  //     },
  //     data: {
  //       status: TransactionStatus.SUCCESS,
  //       confirmedAt: new Date(),
  //     },
  //   });

  //   if (updated.count === 0) return { ok: true };

  //   await this.prisma.wallet.update({
  //     where: { id: tx.walletId },
  //     data: {
  //       pendingBalance: { increment: tx.amount * 0.9 },
  //     },
  //   });

  //   return { ok: true };
  // }
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() body: SepayWebhookPayload) {
    if (!body) return { ok: true };

    const { content, transferType, transferAmount } = body;

    // Kiểm tra content tồn tại và là giao dịch nhận tiền
    if (!content || transferType !== 'in' || !transferAmount)
      return { ok: true };

    const tx = await this.prisma.walletTransaction.findFirst({
      where: {
        sepayOrderId: content,
        type: TransactionType.RENTAL_PENDING,
      },
    });

    if (!tx) return { ok: true };

    // 🔒 ATOMIC UPDATE
    const updated = await this.prisma.walletTransaction.updateMany({
      where: {
        id: tx.id,
        status: TransactionStatus.PENDING,
      },
      data: {
        status: TransactionStatus.SUCCESS,
        confirmedAt: new Date(),
      },
    });

    if (updated.count === 0) return { ok: true };

    await this.prisma.wallet.update({
      where: { id: tx.walletId },
      data: {
        pendingBalance: { increment: tx.amount * 0.905 },
      },
    });
    if (tx.bookingId) {
      await this.prisma.booking.update({
        where: { id: tx.bookingId },
        data: {
          status: BookingStatus.PENDING_CONFIRMATION,
          updatedAt: new Date(),
        },
      });
    }

    return { ok: true };
  }
}
