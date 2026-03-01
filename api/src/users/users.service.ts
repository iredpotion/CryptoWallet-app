import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

// Serviço responsável pela gestão e persistência dos dados dos usuários no banco de dados
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Cria um novo usuário garantindo a criptografia da senha antes da persistência
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
  }

  // Busca o registro de um usuário utilizando seu endereço de e-mail
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  // Busca o registro de um usuário pelo seu identificador único (ID)
  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  // Atualiza os dados de um usuário específico de forma parcial
  async update(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}