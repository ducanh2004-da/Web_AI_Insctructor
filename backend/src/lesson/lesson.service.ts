import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { LessonDAO } from '@/lesson/lesson.dao';
import { CreateLessonDto } from '@/common/model/DTO/lesson/create-lesson.dto';
import { UpdateLessonDto } from '@/common/model/DTO/lesson/update-lesson.dto';
import { Lesson } from '@prisma/client';

@Injectable()
export class LessonService {
  constructor(private readonly lessonDAO: LessonDAO) {}

  async createLesson(data: CreateLessonDto): Promise<Lesson> {
    return this.lessonDAO.createLesson({
      lessonName: data.lessonName,
      abstract: data.abstract ?? null,
      courseId: data.courseId,
    });
  }

  async getLessonById(id: string): Promise<Lesson | null> {
    return this.lessonDAO.getLessonById(id);
  }

  async getLessonsByCourseId(id: string): Promise<Lesson[]> {
    return this.lessonDAO.getLessonsByCourseId(id);
  }
  async getAllLessons(): Promise<Lesson[]> {
    return this.lessonDAO.getAllLessons();
  }
  async updateLesson(data: UpdateLessonDto): Promise<Lesson> {
    return this.lessonDAO.updateLesson(data.id, data);
  }

  async deleteLesson(id: string): Promise<Lesson> {
    return this.lessonDAO.deleteLesson(id);
  }
  async markDone(id: string, isDone: boolean): Promise<Lesson>{
    return this.lessonDAO.markDone(id, isDone);
  }
}
