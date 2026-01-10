import { Controller, Post, Body } from '@nestjs/common';
import { SepayService } from './sepay.service';

@Controller('sepay')
export class SepayController {
  constructor(private sepay: SepayService) {}

  // @Post('create-qr')
  // async createQR(@Body() body: { amount: number; userId: string }) {
  //   const content = `PAYIN_USER_${body.userId}`;

  //   const qr = await this.sepay.createDepositQR(body.amount, content);

  //   return {
  //     qr,
  //     content,
  //   };
  // }
}
