import { Module } from '@nestjs/common';
import { LessonExplanationService } from './lesson-explanation.service';
import { LessonExplanationDAO } from './lesson-explanation.dao';
import { LessonExplanationResolver } from './lesson-explanation.resolver';
import { PrismaModule } from '@/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [PrismaModule, HttpModule, AuthModule],
  providers: [
    LessonExplanationService,
    LessonExplanationDAO,
    LessonExplanationResolver,
  ],
  exports: [LessonExplanationService],
})
export class LessonExplanationModule {}
