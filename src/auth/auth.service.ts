import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { WalletService } from 'src/wallet/wallet.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private walletService: WalletService, // Injetado para cumprir o requisito da carteira
  ) {}

  // LOGIN: Verifica senha e gera token
  async signIn(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  // CADASTRO: Cria User + Carteira (Requisito 2)
  async register(email: string, pass: string) {
    // 1. Cria o usuário
    const newUser = await this.usersService.create({ email, password: pass });
    
    // 2. Cria a carteira automaticamente [Requisito 23]
    await this.walletService.create(newUser.id);

    return { message: 'Usuário e carteira criados com sucesso!' };
  }
}