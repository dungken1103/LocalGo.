import { Controller, Post, Body } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TransactionStatus, TransactionType } from '@prisma/client';

@Controller('sepay')
export class SepayController {
  constructor(private prisma: PrismaService) {}

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    if (!body) return { ok: true };

    const { amount, content, status } = body;
    if (!content || !amount || status !== 'SUCCESS') return { ok: true };

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
        pendingBalance: { increment: tx.amount * 0.9 },
      },
    });

    return { ok: true };
  }
}
