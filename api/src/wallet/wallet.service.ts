import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from './crypto.service';

// Serviço responsável por gerenciar a lógica de negócios das carteiras, transações, saldos e histórico
@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private cryptoService: CryptoService
  ) {}

  // Cria uma nova carteira digital para o usuário com saldos zerados para os tokens padrão suportados
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

  // Lista todas as carteiras e seus ativos correspondentes presentes no sistema
  async findAll() {
    return this.prisma.wallet.findMany({ include: { assets: true } });
  }

  // Busca uma carteira específica pelo ID do usuário proprietário, incluindo seus ativos
  async findOne(userId: string) {
    return this.prisma.wallet.findUnique({
      where: { userId },
      include: { assets: true },
    });
  }

  // Calcula a cotação estimada, taxas aplicáveis e o valor líquido para uma conversão de tokens
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

  // Processa uma transação de swap de forma atômica, atualizando saldos e registrando as movimentações
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

  // Efetua a retirada de fundos de um ativo específico da carteira de forma atômica
  async withdraw(userId: string, token: string, amount: number) {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
        include: { assets: true },
      });

      if (!wallet) throw new NotFoundException('Wallet not found');

      const asset = wallet.assets.find((a) => a.token === token);
      if (!asset || Number(asset.balance) < amount) {
        throw new BadRequestException('Insufficient balance for withdrawal');
      }

      const newBalance = Number(asset.balance) - amount;
      
      await tx.walletAsset.update({
        where: { id: asset.id },
        data: { balance: newBalance },
      });

      const statement = await tx.walletStatement.create({
        data: {
          walletId: wallet.id,
          token,
          type: 'WITHDRAWAL',
          amount: -amount,
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

  // Retorna o histórico paginado de movimentações (extrato) de uma carteira
  async getStatement(userId: string, page: number = 1, limit: number = 10) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) throw new NotFoundException('Wallet not found');

    const skip = (page - 1) * limit;

    const statements = await this.prisma.walletStatement.findMany({
      where: { walletId: wallet.id },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

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