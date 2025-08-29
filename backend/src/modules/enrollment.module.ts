import { Module } from '@nestjs/common';
import { EnrollmentResolver } from '../common/resolvers/enrollment.resolver';
import { EnrollmentService } from '../common/providers/enrollment.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EnrollmentDAO } from '@/common/DAO/enrollment.dao';
import { AuthModule } from './auth.module';

@Module({
  imports: [PrismaModule, AuthModule], // Import PrismaModule
  providers: [
    EnrollmentResolver,
    EnrollmentDAO,
    EnrollmentService,
    PrismaService,
  ],
  exports: [EnrollmentService], // Xuất EnrollmentService để sử dụng ở nơi khác
})
export class EnrollmentModule {}
