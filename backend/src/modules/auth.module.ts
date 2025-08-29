/* eslint-disable @typescript-eslint/require-await */
import { Module } from '@nestjs/common';
import { AuthService } from '../common/providers/auth.service';
import { AuthResolver } from '../common/resolvers/auth.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from '../common/providers/google.strategy';
import { AuthDAO } from '../common/DAO/auth.dao';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '12h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    AuthResolver,
    AuthDAO,
    PrismaService,
    GoogleStrategy,
  ],
  exports: [AuthService, JwtModule], // Added JwtModule to exports
})
export class AuthModule {}
