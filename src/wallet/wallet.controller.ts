import { Controller, Get, Post, Body, UseGuards, Req, Query } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { AuthGuard } from '@nestjs/passport'; // Assumindo que configurou no Dia 1

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findOne(@Req() req) {
    return this.walletService.findOne(req.user.userId);
  }

  // Debug: Ver todas (apenas admin deveria ver, mas ok pro teste)
  @Get('all')
  findAll() {
    return this.walletService.findAll();
  }

  // Cotação
  @Get('swap/quote')
  @UseGuards(AuthGuard('jwt'))
  getQuote(
      @Query('from') from: string,
      @Query('to') to: string,
      @Query('amount') amount: string
  ) {
      return this.walletService.getSwapQuote(from, to, Number(amount));
  }

  // Executar Swap
  @Post('swap')
  @UseGuards(AuthGuard('jwt'))
  executeSwap(@Req() req, @Body() body: { from: string; to: string; amount: number }) {
      return this.walletService.executeSwap(req.user.userId, body.from, body.to, body.amount);
  }
}