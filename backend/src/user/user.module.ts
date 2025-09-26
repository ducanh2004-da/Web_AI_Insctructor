import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { UserDAO } from './user.dao';
import { AuthModule } from '@/auth/auth.module';
import { IUserDAO } from '../common/interfaces/user.dao.interface';
import { PrismaModule } from '@/prisma/prisma.module';
 
@Module({
  imports: [PrismaModule, AuthModule],
  providers: [
    UserResolver,
    PrismaService,
    UserDAO,
    UserService,
  ],
  exports: [UserService],
})
export class UserModule {}
