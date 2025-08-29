import { Module } from '@nestjs/common';
import { LessonService } from '../common/providers/lesson.service';
import { LessonResolver } from '../common/resolvers/lesson.resolver';
import { LessonDAO } from '../common/DAO/lesson.dao';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth.module';

@Module({
  imports: [PrismaModule, AuthModule], // Import PrismaModule
  providers: [LessonService, LessonResolver, LessonDAO],
  exports: [LessonService],
})
export class LessonModule {}
