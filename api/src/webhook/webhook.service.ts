import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DepositWebhookDto } from './dto/deposit-webhook.dto';

@Injectable()
export class WebhookService {
  constructor(private prisma: PrismaService) {}

  async processDeposit(dto: DepositWebhookDto) {
    const { userId, token, amount, idempotencyKey } = dto;

    // 1. Verificar Idempotência 
    const existingKey = await this.prisma.idempotencyLog.findUnique({
      where: { key: idempotencyKey },
    });

    if (existingKey) {
      // Se já processou, retorna sucesso (200) ou erro (409) dependendo da regra de negócio.
      // Geralmente em webhooks, se já foi processado com sucesso, retornamos 200 novamente.
      return { message: 'Transaction already processed', status: 'skipped' };
    }

    // 2. Buscar Carteira do Usuário
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: { assets: true },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found for this user'); // 
    }

    // Validar Tokens permitidos (BRL, BTC, ETH) [cite: 24]
    const allowedTokens = ['BRL', 'BTC', 'ETH'];
    if (!allowedTokens.includes(token)) {
      throw new BadRequestException(`Token ${token} not supported`); // 
    }

    // 3. Executar Transação Atômica (Balance + Ledger + Idempotency)
    await this.prisma.$transaction(async (tx) => {
      
      // A. Buscar ou Criar o Asset (ex: saldo de BTC)
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
      const newBalance = Number(oldBalance) + amount; // Cuidado com precisão JS em produção real

      // B. Atualizar Saldo [cite: 34]
      await tx.walletAsset.update({
        where: { id: asset.id },
        data: { balance: newBalance },
      });

      // C. Criar Registro no Ledger (Movimentação) [cite: 54, 55, 56]
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

      // D. Salvar Idempotency Key
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