import { Controller, Get, Post, Body, UseGuards, Req, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WalletService } from './wallet.service';
import { CryptoService } from './crypto.service';

// Controlador responsável por gerenciar as operações da carteira digital, como saldos, extratos e transações
@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly cryptoService: CryptoService
  ) {}

  // Retorna os dados detalhados da carteira do usuário autenticado
  @Get()
  @UseGuards(AuthGuard('jwt'))
  findOne(@Req() req) {
    return this.walletService.findOne(req.user.userId);
  }

  // Retorna uma lista com todas as carteiras registradas no sistema
  @Get('all')
  findAll() {
    return this.walletService.findAll();
  }

  // Calcula e retorna a cotação estimada para uma conversão (swap) entre dois tokens
  @Get('swap/quote')
  @UseGuards(AuthGuard('jwt'))
  getQuote(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('amount') amount: string
  ) {
    return this.walletService.getSwapQuote(from, to, Number(amount));
  }

  // Executa a operação de conversão (swap) de um token para outro na carteira do usuário
  @Post('swap')
  @UseGuards(AuthGuard('jwt'))
  executeSwap(@Req() req, @Body() body: { from: string; to: string; amount: number }) {
    return this.walletService.executeSwap(req.user.userId, body.from, body.to, body.amount);
  }

  // Processa a retirada de fundos de um token específico da carteira do usuário
  @Post('withdraw')
  @UseGuards(AuthGuard('jwt'))
  withdraw(@Req() req, @Body() body: { token: string; amount: number }) {
    return this.walletService.withdraw(req.user.userId, body.token, body.amount);
  }

  // Lista o histórico de transações (extrato) da carteira do usuário com suporte a paginação
  @Get('statement')
  @UseGuards(AuthGuard('jwt'))
  getStatement(
    @Req() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.walletService.getStatement(req.user.userId, page, limit);
  }

  // Fornece os dados atualizados de mercado para os principais tokens suportados
  @Get('market')
  async getMarket() {
    return this.cryptoService.getMarketData(['BTC', 'ETH', 'USDT']);
  }
}