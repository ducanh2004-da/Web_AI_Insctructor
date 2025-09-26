import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { LessonExplanation } from '@prisma/client';

@Injectable()
export class LessonExplanationDAO {
  constructor(private readonly prisma: PrismaService) {}

  async createLessonExplanation(data: {
    content: string;
    emotion: string;
    lessonId: string;
    userId: string;
  }): Promise<LessonExplanation> {
    return this.prisma.lessonExplanation.create({
      data,
      include: {
        lesson: true,
        user: true,
      },
    });
  }

  async getLessonExplanationById(
    id: string,
  ): Promise<LessonExplanation | null> {
    return this.prisma.lessonExplanation.findUnique({
      where: { id },
      include: {
        lesson: true,
        user: true,
      },
    });
  }

  async getLessonExplanationByLessonAndUser(
    lessonId: string,
    userId: string,
  ): Promise<LessonExplanation | null> {
    return this.prisma.lessonExplanation.findUnique({
      where: {
        lessonId_userId: {
          lessonId,
          userId,
        },
      },
      include: {
        lesson: true,
        user: true,
      },
    });
  }

  async updateLessonExplanation(
    id: string,
    data: Partial<LessonExplanation>,
  ): Promise<LessonExplanation> {
    return this.prisma.lessonExplanation.update({
      where: { id },
      data,
      include: {
        lesson: true,
        user: true,
      },
    });
  }

  async deleteLessonExplanation(id: string): Promise<LessonExplanation> {
    return this.prisma.lessonExplanation.delete({
      where: { id },
      include: {
        lesson: true,
        user: true,
      },
    });
  }
}
