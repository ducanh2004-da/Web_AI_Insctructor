import { Module } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { LessonResolver } from './lesson.resolver';
import { LessonDAO } from './lesson.dao';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '@/auth/auth.module';
import { ProgressModule } from '@/progress/progress.module';

@Module({
  imports: [PrismaModule, AuthModule, ProgressModule], // Import PrismaModule
  providers: [LessonService, LessonResolver, LessonDAO],
  exports: [LessonService],
})
export class LessonModule {}
