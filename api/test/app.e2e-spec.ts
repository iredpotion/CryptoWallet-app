import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';

// Usar o require clássico resolve 100% dos erros de "not callable" do TypeScript com o Supertest
const request = require('supertest');

describe('Crypto Wallet API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // IMPORTANTE: Precisamos de replicar a configuração do main.ts aqui!
    // Se usar Pipes globais (como o Zod) na aplicação, tem de os ativar no teste.
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    
    await app.init();
  });

  afterAll(async () => {
    // Garante que as ligações à base de dados (Prisma) são fechadas no final
    await app.close();
  });

  // TESTE 1: Segurança (AuthGuard)
  it('/wallet (GET) - deve bloquear acesso sem token JWT (401 Unauthorized)', () => {
    return request(app.getHttpServer())
      .get('/wallet')
      .expect(401); 
  });

  // TESTE 2: Rota Pública do Mercado
  it('/wallet/market (GET) - deve retornar as cotações com sucesso (200 OK)', async () => {
    const response = await request(app.getHttpServer())
      .get('/wallet/market')
      .expect(200); 
    
    expect(Array.isArray(response.body)).toBe(true);
  });

  // TESTE 3: Validação de Payload (Webhook)
  it('/webhooks/deposit (POST) - deve falhar se o payload estiver vazio (400 Bad Request)', () => {
    return request(app.getHttpServer())
      .post('/webhooks/deposit')
      .send({}) // Enviamos um corpo vazio para testar se o Zod/ValidationPipe nos protege
      .expect(400); 
  });
});