import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('all')
  findAll() {
    return this.walletService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findOne(@Req() req) {    
    const userId = req.user.userId; 
    return this.walletService.findOne(userId);
  }
}