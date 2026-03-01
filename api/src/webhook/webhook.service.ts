import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DepositWebhookDto } from './dto/deposit-webhook.dto';

// Serviço responsável por processar de forma segura as notificações e eventos de sistemas externos
@Injectable()
export class WebhookService {
  constructor(private prisma: PrismaService) {}

  // Processa depósitos garantindo a idempotência da requisição, validando os dados e atualizando saldos de forma atômica
  async processDeposit(dto: DepositWebhookDto) {
    const { userId, token, amount, idempotencyKey } = dto;

    const existingKey = await this.prisma.idempotencyLog.findUnique({
      where: { key: idempotencyKey },
    });

    if (existingKey) {
      return { message: 'Transaction already processed', status: 'skipped' };
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: { assets: true },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found for this user');
    }

    const allowedTokens = ['BRL', 'BTC', 'ETH'];
    if (!allowedTokens.includes(token)) {
      throw new BadRequestException(`Token ${token} not supported`);
    }

    await this.prisma.$transaction(async (tx) => {
      let asset = await tx.walletAsset.findUnique({
        where: {
          walletId_token: { walletId: wallet.id, token },
        },
      });

      if (!asset) {
        asset = await tx.walletAsset.create({
          data: { walletId: wallet.id, token, balance: 0 },
        });
      }

      const oldBalance = asset.balance;
      const newBalance = Number(oldBalance) + amount;

      await tx.walletAsset.update({
        where: { id: asset.id },
        data: { balance: newBalance },
      });

      await tx.walletStatement.create({
        data: {
          walletId: wallet.id,
          token: token,
          type: 'DEPOSIT',
          amount: amount,
          balanceBefore: oldBalance,
          balanceAfter: newBalance,
        },
      });

      await tx.idempotencyLog.create({
        data: {
          key: idempotencyKey,
          method: 'DEPOSIT',
          responseStatus: 201,
        },
      });
    });

    return { message: 'Deposit processed successfully', newBalance: true };
  }
}