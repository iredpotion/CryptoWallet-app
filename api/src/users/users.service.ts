import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto) {
    // 1. Criptografa a senha (Salt rounds = 10)
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 2. Cria o usuário no banco
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data: data,
    });
  }
}