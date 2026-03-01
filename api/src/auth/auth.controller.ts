import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

// Controlador responsável por expor os endpoints de autenticação e gestão de sessão da API
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Cria uma nova conta de usuário e retorna os tokens de acesso iniciais
  @Post('register')
  register(@Body() registerDto: CreateUserDto) {
    return this.authService.register(registerDto.email, registerDto.password);
  }

  // Autentica um usuário existente e retorna um novo par de tokens JWT
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: CreateUserDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }
  
  // Renova a sessão do usuário utilizando o token de atualização (refresh token)
  @Post('refresh')
  refresh(@Body() body: { userId: string; refreshToken: string }) {
    return this.authService.refreshTokens(body.userId, body.refreshToken);
  }
  
  // Encerra a sessão ativa do usuário protegido, invalidando seus tokens no servidor
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  logout(@Req() req) {
    return this.authService.logout(req.user.userId);
  }
}