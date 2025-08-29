import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthDAO {
  constructor(private prisma: PrismaService) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(data: {
    email: string;
    username?: string;
    password?: string;
    googleId?: string;
    role: string;
  }): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async updateUserGoogleId(email: string, googleId: string): Promise<User> {
    return this.prisma.user.update({
      where: { email },
      data: { googleId },
    });
  }
}
