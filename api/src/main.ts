import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors();

  // O Zod (usado no Login/Signup) não emite metadados compreendidos pelo class-validator.
  // Portanto, removemos whitelist e forbidNonWhitelisted para que as requisições
  // do Zod não cheguem vazias no controller e tomem erro 400 Bad Request.
  app.useGlobalPipes(new ValidationPipe({
    transform: true
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
