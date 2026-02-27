import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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
            { token: 'BRL', balance: 0 },
            { token: 'BTC', balance: 0 },
            { token: 'ETH', balance: 0 },
          ],
        },
      },
      include: { assets: true },
    });
  }

  async findAll() {
    return this.prisma.wallet.findMany({ include: { assets: true } });
  }

  async findOne(userId: string) {
    return this.prisma.wallet.findUnique({
      where: { userId },
      include: { assets: true },
    });
  }

  // Taxa de Transação
  async getSwapQuote(fromToken: string, toToken: string, amount: number) {
    const price = await this.cryptoService.getPrice(fromToken, toToken);
    const feePercentage = 0.015;

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

  // Transação
  async executeSwap(userId: string, fromToken: string, toToken: string, amount: number) {
    const quote = await this.getSwapQuote(fromToken, toToken, amount);

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
        include: { assets: true },
      });

      if (!wallet) throw new BadRequestException('Wallet not found');

      const assetFrom = wallet.assets.find((a) => a.token === fromToken);
      if (!assetFrom || Number(assetFrom.balance) < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      let assetTo = wallet.assets.find((a) => a.token === toToken);
      if (!assetTo) {
        assetTo = await tx.walletAsset.create({
          data: { walletId: wallet.id, token: toToken, balance: 0 },
        });
      }

      const netAmount = amount - quote.fee;
      const newBalanceFrom = Number(assetFrom.balance) - amount;
      const newBalanceTo = Number(assetTo.balance) + quote.estimatedOutput;

      await tx.walletAsset.update({
        where: { id: assetFrom.id },
        data: { balance: newBalanceFrom },
      });

      await tx.walletAsset.update({
        where: { id: assetTo.id },
        data: { balance: newBalanceTo },
      });

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

      await tx.walletStatement.create({
        data: {
          walletId: wallet.id,
          token: fromToken,
          type: 'SWAP_FEE',
          amount: -quote.fee,
          balanceBefore: Number(assetFrom.balance) - netAmount,
          balanceAfter: newBalanceFrom,
        },
      });

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

  // SAQUE
  async withdraw(userId: string, token: string, amount: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Buscar a carteira
      const wallet = await tx.wallet.findUnique({
        where: { userId },
        include: { assets: true },
      });

      if (!wallet) throw new NotFoundException('Wallet not found');

      // 2. Validar saldo
      const asset = wallet.assets.find((a) => a.token === token);
      if (!asset || Number(asset.balance) < amount) {
        throw new BadRequestException('Insufficient balance for withdrawal');
      }

      // 3. Atualizar saldo (Debitar)
      const newBalance = Number(asset.balance) - amount;
      await tx.walletAsset.update({
        where: { id: asset.id },
        data: { balance: newBalance },
      });

      // 4. Registrar a transação de saque no Ledger
      const statement = await tx.walletStatement.create({
        data: {
          walletId: wallet.id,
          token,
          type: 'WITHDRAWAL', // Requisito 55
          amount: -amount, // Valor negativo pois é saída
          balanceBefore: asset.balance,
          balanceAfter: newBalance,
        },
      });

      return {
        success: true,
        message: 'Withdrawal processed successfully',
        transactionId: statement.id,
      };
    });
  }

  //EXTRATO / HISTÓRICO COM PAGINAÇÃO
  async getStatement(userId: string, page: number = 1, limit: number = 10) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) throw new NotFoundException('Wallet not found');

    const skip = (page - 1) * limit;

    // Busca as movimentações paginadas e ordenadas pelas mais recentes
    const statements = await this.prisma.walletStatement.findMany({
      where: { walletId: wallet.id },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Conta o total de registros para informar no meta-dado da paginação
    const total = await this.prisma.walletStatement.count({
      where: { walletId: wallet.id },
    });

    return {
      data: statements,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}