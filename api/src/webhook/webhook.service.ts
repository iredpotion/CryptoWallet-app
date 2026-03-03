import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DepositWebhookDto } from './dto/deposit-webhook.dto';

@Injectable()
export class WebhookService {
  constructor(private prisma: PrismaService) {}

  async processDeposit(dto: DepositWebhookDto) {
    const { userId, token, amount, idempotencyKey } = dto;

    const allowedTokens = ['BRL', 'BTC', 'ETH'];
    if (!allowedTokens.includes(token)) {
      throw new BadRequestException(`Token ${token} not supported`);
    }

    try {
      // Iniciamos a transação imediatamente
      await this.prisma.$transaction(async (tx) => {
        // Criar o log de idempotência PRIMEIRO.
        // Se houver concorrência exata no mesmo milissegundo, o banco lançará 
        // um erro de violação de chave única (P2002) e abortará a transação clonada.
        await tx.idempotencyLog.create({
          data: {
            key: idempotencyKey,
            method: 'DEPOSIT',
            responseStatus: 201,
          },
        });

        // 2. Busca a carteira
        const wallet = await tx.wallet.findUnique({
          where: { userId },
        });

        if (!wallet) {
          throw new BadRequestException('Wallet not found for this user');
        }

        // 3. Busca ou cria o ativo
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

        // 4. Atualiza o saldo
        await tx.walletAsset.update({
          where: { id: asset.id },
          data: { balance: newBalance },
        });

        // 5. Registra o extrato
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
      });

      return { message: 'Deposit processed successfully', newBalance: true };

    } catch (error) {
      // Captura o erro específico de chave duplicada do Prisma (Race Condition evitada com sucesso)
      if (error.code === 'P2002') {
        return { message: 'Transaction already processed', status: 'skipped' };
      }
      throw error;
    }
  }
}