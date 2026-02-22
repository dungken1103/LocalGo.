// import { Injectable } from '@nestjs/common';
// import { HttpService } from '@nestjs/axios';
// import { ConfigService } from '@nestjs/config';
// import { SchedulerRegistry } from '@nestjs/schedule';
// import { Cron } from '@nestjs/schedule';
// import { firstValueFrom } from 'rxjs';

// @Injectable()
// export class SepayService {
//   constructor(
//     private http: HttpService,
//     private config: ConfigService,
//     private schedulerRegistry: SchedulerRegistry
//   ) {}

//   @Cron('*/15 * * * *') // Chạy mỗi 15 phút
//   async checkNewTransactions() {
//     const baseUrl = this.config.get<string>('sepay.baseUrl');
//     const accountNo = this.config.get<string>('sepay.accountNo');
//     const apiKey = this.config.get<string>('sepay.apiKey');

//     try {
//       const res = await firstValueFrom(
//         this.http.get(`${baseUrl}/transactions/list`, {
//           params: {
//             account_number: accountNo,
//             transaction_date_min: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 phút trước
//           },
//           headers: {
//             'X-API-KEY': apiKey,
//           },
//         })
//       );

//       console.log('New transactions:', res.data.transactions);
//       // Xử lý giao dịch mới ở đây
//     } catch (error) {
//       console.error('Error checking new transactions:', error.response?.data || error.message);
//     }
//   }

//   async createDepositQR(amount: number, description: string) {
//     const apiKey = this.config.get<string>('sepay.apiKey');
//     const baseUrl = this.config.get<string>('sepay.baseUrl');

//     const bankId = this.config.get<string>('sepay.bankId');
//     const accountNo = this.config.get<string>('sepay.accountNo');

//     try {
//       console.log("Sending request to:", `${baseUrl}/transactions/create`);
//       console.log("Payload:", {
//         bank_id: bankId,
//         account_no: accountNo,
//         amount: amount,
//         description: description,
//         type: "bank",
//       });

//       const res = await firstValueFrom(
//         this.http.post(
//           `${baseUrl}/transactions/create`,
//           {
//             bank_id: bankId,
//             account_no: accountNo,
//             amount: amount,
//             description: description,
//             type: "bank",               // QUAN TRỌNG cho sandbox
//           },
//           {
//             headers: {
//               'X-API-KEY': apiKey,
//               'Content-Type': 'application/json',
//             },
//           },
//         )
//       );

//       console.log("SEPAY CREATE RESPONSE:", res.data);
//       console.log("Response status:", res.status);
//       console.log("Response data:", res.data);
//       return res.data.data.qr_link;
//     } catch (error) {
//       console.error("Error creating deposit QR:", error.response?.data || error.message);
//       throw new Error("Failed to create deposit QR. Please check the logs for details.");
//     }
//   }
// }
// wallet/sepay.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { TransactionStatus } from '@prisma/client';
import Sepay from 'sepay-pg-node';

@Injectable()
export class SepayService {
  async createCheckout(userId: string, amount: number) {
    const orderId = `INV_${Date.now()}`;
    const checkout = await Sepay.checkout.create({
      merchant: process.env.SEPAY_MERCHANT,
      secret: process.env.SEPAY_SECRET,
      sandbox: true,
      order_amount: amount,
      order_currency: 'VND',
      order_description: `Nạp ví cho user ${userId}`,
      order_invoice_number: orderId,
      success_url: `http://localhost:5173/deposit/success?orderId=${orderId}`,
      error_url: `http://localhost:5173/deposit/error?orderId=${orderId}`,
      cancel_url: `http://localhost:5173/deposit/cancel?orderId=${orderId}`,
    });

    return checkout.url;
  }

  private readonly logger = new Logger(SepayService.name);

  constructor(private prisma: PrismaService) {}

  // 🔹 Cron chạy mỗi 15 phút
  @Cron('*/30 * * * * *')
  async removePendingTransactions() {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const deleted = await this.prisma.walletTransaction.deleteMany({
      where: {
        status: TransactionStatus.PENDING,
        createdAt: { lt: fifteenMinutesAgo }, // tạo trước 15 phút
      },
    });
    if (deleted.count > 0) {
      this.logger.log(
        `Deleted ${deleted.count} pending transactions older than 15 minutes`,
      );
    }
  }
}
