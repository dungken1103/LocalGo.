import { Controller, Post, Body } from '@nestjs/common';
import { WalletService } from '../wallet/wallet.service';

type SepayWebhookBody = {
  description?: string;
  amount?: number;
};

@Controller('sepay')
export class SepayWebhookController {
  constructor(private walletService: WalletService) {}

  @Post('webhook')
  async handleWebhook(@Body() data: SepayWebhookBody) {
    console.log('🟢 SANDBOX WEBHOOK DATA');
    console.log(JSON.stringify(data, null, 2));

    // chỉ test sandbox => bỏ verify signature
    if (!data) return { ok: false };

    // lấy nội dung chuyển khoản
    const description: string = data.description || '';

    // parse user id
    const match = description.match(/PAYIN_USER_(\w+)/);

    if (!match) {
      console.log('❌ Không tìm thấy userId trong description');
      return { ok: false };
    }

    const userId = match[1];
    const amount = Number(data.amount || 0);

    await this.walletService.payin(userId, amount);

    return { ok: true };
  }
}
