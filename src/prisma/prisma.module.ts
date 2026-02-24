import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Isso faz o serviço ficar disponível no app todo!
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}