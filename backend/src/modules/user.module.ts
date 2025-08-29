import { Module } from '@nestjs/common';
import { UserService } from '../common/providers/user.service';
import { UserResolver } from '../common/resolvers/user.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { UserDAO } from '../common/DAO/user.dao';
import { USER_DAO } from '../common/DAO/user.constants';
import { AuthModule } from './auth.module';
import { IUserDAO } from '../common/interfaces/user.dao.interface';
import { PrismaModule } from '@/prisma/prisma.module';
 
@Module({
  imports: [PrismaModule, AuthModule],
  providers: [
    UserResolver,
    PrismaService,

    // 1. Đăng ký class UserDAO cho token USER_DAO
    {
      provide: USER_DAO,
      useClass: UserDAO,
    },

    // 2. UserService hỏi Nest inject đúng token này
    UserService,
  ],
  exports: [UserService],
})
export class UserModule {}
