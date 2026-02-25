import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { WalletService } from 'src/wallet/wallet.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private walletService: WalletService,
  ) {}

  // 1. LOGIN (Agora retorna os dois tokens)
  async signIn(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    
    return tokens;
  }

  // 2. CADASTRO (Também já loga o usuário retornando tokens)
  async register(email: string, pass: string) {
    const newUser = await this.usersService.create({ email, password: pass });
    await this.walletService.create(newUser.id);
    
    const tokens = await this.getTokens(newUser.id, newUser.email);
    await this.updateRefreshToken(newUser.id, tokens.refresh_token);

    return tokens;
  }

  // 3. LOGOUT (Remove o refresh token do banco)
  async logout(userId: string) {
    await this.usersService.update(userId, { hashedRefreshToken: null });
  }

  // 4. REFRESH (A lógica mágica de renovar)
  async refreshTokens(userId: string, rt: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.hashedRefreshToken) 
      throw new ForbiddenException('Acesso negado');

    // Compara o Refresh Token enviado com o Hash no banco
    const rtMatches = await bcrypt.compare(rt, user.hashedRefreshToken);
    if (!rtMatches) 
      throw new ForbiddenException('Acesso negado');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    
    return tokens;
  }

  // --- MÉTODOS AUXILIARES ---

  // Gera o Hash e salva no banco (Usamos o update do UsersService)
  async updateRefreshToken(userId: string, rt: string) {
    const hash = await bcrypt.hash(rt, 10);
    await this.usersService.update(userId, { hashedRefreshToken: hash });
  }

  // Gera o par de tokens JWT
  async getTokens(userId: string, email: string) {
    const [at, rt] = await Promise.all([
      // Access Token: Expira rápido (15 min)
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: 'SEGREDO_SUPER_SECRETO', expiresIn: '15m' },
      ),
      // Refresh Token: Dura bastante (7 dias)
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: 'SEGREDO_SUPER_SECRETO', expiresIn: '7d' },
      ),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}