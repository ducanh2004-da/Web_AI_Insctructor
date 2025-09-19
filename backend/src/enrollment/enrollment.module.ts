import { Module } from '@nestjs/common';
import { EnrollmentResolver } from './enrollment.resolver';
import { EnrollmentService } from './enrollment.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EnrollmentDAO } from '@/enrollment/enrollment.dao';
import { AuthModule } from '@/auth/auth.module';

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
