import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { User } from '@prisma/client';
import { IUserDAO } from '@/common/interfaces/user.dao.interface';
import { UpdateUserInput } from '@/common/DTO/user/user.input';

@Injectable()
export class UserDAO implements IUserDAO {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: {
    email: string;
    username?: string;
    password?: string;
    phoneNumber?: string;
    role: string;
  }) {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: UpdateUserInput) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
  async delete(id: string) {
    await this.prisma.user.delete({ where: { id } });
  }
}