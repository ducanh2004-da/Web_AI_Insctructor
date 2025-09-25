// src/service/progress.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UpdateProgressInput } from '@/common/model/DTO/progress/progress.input';
import { ProgressStatus } from '@prisma/client';
import { ProgressContext } from '@/common/middleware/progress-context';
import { ProgressDAO } from './progress.dao';

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progressDAO: ProgressDAO,
  ) {}

  private async calculateProgress(
    courseId: string,
    completedLessons: number,
    initialStatus: ProgressStatus,
  ): Promise<{
    totalLessons: number;
    percentage: number;
    status: ProgressStatus;
  }> {
    const course = await this.progressDAO.findCourseById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const totalLessons = course._count.lessons;
    const context = new ProgressContext(initialStatus);

    const { percentage, status } = context.handleCalculate(
      completedLessons,
      totalLessons,
    );

    return { totalLessons, percentage, status };
  }

  async updateProgress(input: UpdateProgressInput) {
    return this.prisma.$transaction(async (tx) => {
      const progress = await this.progressDAO.findProgressById(input.progressId);
      if (!progress) {
        throw new NotFoundException('Progress not found');
      }
      const completeTask = await this.prisma.lesson.count({
        where:{
          isDone: true
        }
      });

      const { totalLessons, percentage, status } =
        await this.calculateProgress(
          progress.courseId,
          completeTask,
          progress.status,
        );

      return this.progressDAO.updateProgress(tx, input.progressId, {
        completedLessons: completeTask,
        percentage,
        status,
      });
    });
  }

  async getProgress(progressId: string) {
    const progress = await this.progressDAO.findProgress(progressId);
    if (!progress) {
      throw new NotFoundException('Progress not found');
    }
    return {
      ...progress,
      courseName: progress.course.courseName,
      totalLessons: progress.course._count.lessons,
    };
  }
}