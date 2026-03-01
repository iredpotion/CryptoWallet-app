import { Controller, Get, Post, Body, UseGuards, Req, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { AuthGuard } from '@nestjs/passport';
import { CryptoService } from './crypto.service'; // Ajuste o caminho se o CryptoService estiver em outra pasta

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly cryptoService: CryptoService // <-- Injetando o CryptoService aqui
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findOne(@Req() req) {
    return this.walletService.findOne(req.user.userId);
  }

  @Get('all')
  findAll() {
    return this.walletService.findAll();
  }

  @Get('swap/quote')
  @UseGuards(AuthGuard('jwt'))
  getQuote(
      @Query('from') from: string,
      @Query('to') to: string,
      @Query('amount') amount: string
  ) {
      return this.walletService.getSwapQuote(from, to, Number(amount));
  }

  @Post('swap')
  @UseGuards(AuthGuard('jwt'))
  executeSwap(@Req() req, @Body() body: { from: string; to: string; amount: number }) {
      return this.walletService.executeSwap(req.user.userId, body.from, body.to, body.amount);
  }

  // Endpoint de Saque
  @Post('withdraw')
  @UseGuards(AuthGuard('jwt'))
  withdraw(@Req() req, @Body() body: { token: string; amount: number }) {
    return this.walletService.withdraw(req.user.userId, body.token, body.amount);
  }

  // Endpoint de Extrato (com paginação via Query Params)
  @Get('statement')
  @UseGuards(AuthGuard('jwt'))
  getStatement(
    @Req() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.walletService.getStatement(req.user.userId, page, limit);
  }

  // NOVO: Endpoint do Mercado (Usado pela página de Swap para a Tabela)
  @Get('market')
  async getMarket() {
    return this.cryptoService.getMarketData(['BTC', 'ETH', 'USDT']);
  }
}