import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { WalletModule } from './wallet/wallet.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { WebhookController } from './webhook/webhook.controller';
import { WebhookService } from './webhook/webhook.service';
import { PrismaService } from './prisma/prisma.service';
import { CryptoService } from './wallet/crypto.service';
import { WalletService } from './wallet/wallet.service';

@Module({
  imports: [PrismaModule, WalletModule, UsersModule, AuthModule],
  controllers: [AppController, WebhookController],
  providers: [AppService, WebhookService, PrismaService, WalletService, CryptoService],
})
export class AppModule {}
