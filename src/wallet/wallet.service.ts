import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from './crypto.service';

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private cryptoService: CryptoService
  ) {}

  async create(userId: string) {
    return this.prisma.wallet.create({
      data: {
        userId,
        assets: {
          create: [
            { token: 'BRL', balance: 0 }, // Requisito 24
            { token: 'BTC', balance: 0 },
            { token: 'ETH', balance: 0 },
          ],
        },
      },
      include: {
        assets: true,
      },
    });
  }

  async findAll() {
    return this.prisma.wallet.findMany({
      include: {
        assets: true,
      },
    });
  }

  async findOne(userId: string) {
    return this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        assets: true,
      },
    });
  }

  async getSwapQuote(fromToken: string, toToken: string, amount: number) {
    const price = await this.cryptoService.getPrice(fromToken, toToken); // Requisito 38
    const feePercentage = 0.015; // Requisito 39: Taxa de 1.5%

    const feeAmount = amount * feePercentage;
    const netAmount = amount - feeAmount;
    const estimatedOutput = netAmount * price;

    return {
      fromToken,
      toToken,
      inputAmount: amount,
      fee: feeAmount,
      exchangeRate: price,
      estimatedOutput,
    };
  }

  // Requisito 4 e 6: Executar Swap com Ledger Detalhado
  async executeSwap(userId: string, fromToken: string, toToken: string, amount: number) {
    const quote = await this.getSwapQuote(fromToken, toToken, amount);

    return this.prisma.$transaction(async (tx) => {
      // 1. Buscar carteira
      const wallet = await tx.wallet.findUnique({
        where: { userId },
        include: { assets: true },
      });

      if (!wallet) throw new BadRequestException('Wallet not found');

      // 2. Validar saldo (Requisito 42)
      const assetFrom = wallet.assets.find((a) => a.token === fromToken);
      if (!assetFrom || Number(assetFrom.balance) < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // 3. Preparar saldo de destino
      let assetTo = wallet.assets.find((a) => a.token === toToken);
      if (!assetTo) {
        assetTo = await tx.walletAsset.create({
          data: { walletId: wallet.id, token: toToken, balance: 0 },
        });
      }

      // 4. Cálculos de Saldos
      const netAmount = amount - quote.fee; // Valor líquido convertido
      const newBalanceFrom = Number(assetFrom.balance) - amount; // Debita total (valor + taxa)
      const newBalanceTo = Number(assetTo.balance) + quote.estimatedOutput;

      // 5. Atualizar Saldos no Banco
      await tx.walletAsset.update({
        where: { id: assetFrom.id },
        data: { balance: newBalanceFrom },
      });

      await tx.walletAsset.update({
        where: { id: assetTo.id },
        data: { balance: newBalanceTo },
      });

      // 6. Registrar no Ledger (Requisito 55: Separação de Tipos)
      
      // A) SWAP_OUT: Saída do valor líquido
      await tx.walletStatement.create({
        data: {
          walletId: wallet.id,
          token: fromToken,
          type: 'SWAP_OUT',
          amount: -netAmount,
          balanceBefore: assetFrom.balance,
          balanceAfter: Number(assetFrom.balance) - netAmount,
        },
      });

      // B) SWAP_FEE: Saída da taxa
      await tx.walletStatement.create({
        data: {
          walletId: wallet.id,
          token: fromToken,
          type: 'SWAP_FEE',
          amount: -quote.fee,
          balanceBefore: Number(assetFrom.balance) - netAmount,
          balanceAfter: newBalanceFrom, // Saldo final
        },
      });

      // C) SWAP_IN: Entrada do novo token
      const statementIn = await tx.walletStatement.create({
        data: {
          walletId: wallet.id,
          token: toToken,
          type: 'SWAP_IN',
          amount: quote.estimatedOutput,
          balanceBefore: assetTo.balance,
          balanceAfter: newBalanceTo,
        },
      });

      return {
        success: true,
        swap: quote,
        transactionId: statementIn.id,
      };
    });
  }
}