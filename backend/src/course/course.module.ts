// course.module.ts
import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseResolver } from './course.resolver';
import { CourseDAO } from './course.dao';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule], // Import PrismaModule
  providers: [CourseService, CourseResolver, CourseDAO],
  exports: [CourseService],
})
export class CourseModule {}
