import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SepayService } from './sepay.service';
import { SepayController } from './sepay.controller';
import { SepayWebhookController } from './sepay.webhook.controller';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [HttpModule, ConfigModule, WalletModule],
  controllers: [SepayController, SepayWebhookController],
  providers: [SepayService],
  exports: [SepayService],
})
export class SepayModule {}
