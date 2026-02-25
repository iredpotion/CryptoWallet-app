import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from './crypto.service';

@Module({
  controllers: [WalletController],
  providers: [WalletService, PrismaService, CryptoService],
  exports: [WalletService],
})
export class WalletModule {}
