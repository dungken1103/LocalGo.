import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import sepayConfig from './config/sepay.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SepayModule } from './modules/sepay/sepay.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/user/user.module';
import { DatabaseModule } from './database/database.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [sepayConfig],
    }),
    ScheduleModule.forRoot(),
    SepayModule,
    WalletModule,
    AuthModule,
    UsersModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
