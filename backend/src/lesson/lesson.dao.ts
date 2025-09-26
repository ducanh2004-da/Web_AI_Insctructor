import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { Lesson } from '@prisma/client';
import { ProgressService } from '@/progress/progress.service';
import { UpdateProgressInput } from '@/common/model/DTO/progress/progress.input';

@Injectable()
export class LessonDAO {
  constructor(private readonly prisma: PrismaService, private progress: ProgressService) { }

  async createLesson(data: {
    lessonName: string;
    abstract?: string | null;
    courseId: string;
  }): Promise<Lesson> {
    return this.prisma.lesson.create({ data });
  }
  async getLessonsByCourseId(courseId: string): Promise<Lesson[]> {
    return this.prisma.lesson.findMany({ where: { courseId } });
  }

  async getLessonById(id: string): Promise<Lesson | null> {
    return this.prisma.lesson.findUnique({ where: { id } });
  }

  async getAllLessons(): Promise<Lesson[]> {
    return this.prisma.lesson.findMany();
  }

  async updateLesson(
    id: string,
    data: { lessonName?: string; abstract?: string | null },
  ): Promise<Lesson> {
    return this.prisma.lesson.update({ where: { id }, data });
  }

  async deleteLesson(id: string): Promise<Lesson> {
    return this.prisma.lesson.delete({ where: { id } });
  }
  async markDone(id: string, isDone: boolean): Promise<Lesson> {
    const lesson = this.prisma.lesson.findFirst({
      where: { id }
    });
    const mark = await this.prisma.lesson.update({
      where: { id },
      data: {
        isDone: isDone
      }
    })
    // await this.progress.updateProgress({
    //   userId: "7aa9bceb-0f50-4e8c-b6f8-16a752a31399",
    //   progressId: "5177aadf-e3d2-4ea8-b066-bc54d809047c",
    //   completedLessons: 0,
    // } as UpdateProgressInput);
    await this.progress.updateProgress({
      userId: "7aa9bceb-0f50-4e8c-b6f8-16a752a31399",
      progressId: "5177aadf-e3d2-4ea8-b066-bc54d809047c",
      completedLessons: 0,
    });
    return mark;
  }
}
