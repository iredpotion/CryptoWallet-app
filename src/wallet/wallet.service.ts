import { Injectable } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  // Cria a carteira vinculada a um usuário com os saldos zerados
  async create(userId: string) {
    return this.prisma.wallet.create({
      data: {
        userId,
        balances: {
          createMany: {
            data: [
              { token: 'BRL', amount: 0 }, // [cite: 23] Saldo zero
              { token: 'BTC', amount: 0 }, // [cite: 24] Suporte a BTC
              { token: 'ETH', amount: 0 }, // [cite: 24] Suporte a ETH
            ],
          },
        },
      },
      include: {
        balances: true, // Retorna a carteira já mostrando os saldos
      },
    });
  }

  // Lista todas as carteiras (útil para debug ou admin)
  findAll() {
    return this.prisma.wallet.findMany({
      include: { balances: true },
    });
  }

  // Busca carteira pelo ID do Usuário (para consultar saldo) [cite: 26]
  findOne(userId: string) {
    return this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        balances: {
          select: {
            token: true,
            amount: true,
          },
        },
      },
    });
  }
}
