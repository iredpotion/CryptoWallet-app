import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { WalletService } from 'src/wallet/wallet.service';
import { ConfigService } from '@nestjs/config';

// Serviço responsável por gerenciar a autenticação, emissão e validação de tokens JWT
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private walletService: WalletService,
    private configService: ConfigService,
  ) { }

  // Autentica o usuário validando suas credenciais e retorna os tokens de sessão
  async signIn(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  // Registra um novo usuário, inicializa sua carteira digital e efetua o login inicial
  async register(email: string, pass: string) {
    const newUser = await this.usersService.create({ email, password: pass });
    await this.walletService.create(newUser.id);

    const tokens = await this.getTokens(newUser.id, newUser.email);
    await this.updateRefreshToken(newUser.id, tokens.refresh_token);

    return tokens;
  }

  // Invalida a sessão do usuário removendo o token de atualização armazenado
  async logout(userId: string) {
    await this.usersService.update(userId, { hashedRefreshToken: null });
  }

  // Emite um novo par de tokens caso o token de atualização fornecido seja válido
  async refreshTokens(userId: string, rt: string) {
    const user = await this.usersService.findById(userId);

    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Acesso negado');
    }

    const rtMatches = await bcrypt.compare(rt, user.hashedRefreshToken);
    if (!rtMatches) {
      throw new ForbiddenException('Acesso negado');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  // Gera o hash do token de atualização e o persiste no perfil do usuário
  async updateRefreshToken(userId: string, rt: string) {
    const hash = await bcrypt.hash(rt, 10);
    await this.usersService.update(userId, { hashedRefreshToken: hash });
  }

  // Cria os tokens JWT de acesso (curta duração) e de atualização (longa duração)
  async getTokens(userId: string, email: string) {
    const secret = this.configService.get<string>('JWT_SECRET') || 'SEGREDO_SUPER_SECRETO';
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret, expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret, expiresIn: '7d' },
      ),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}