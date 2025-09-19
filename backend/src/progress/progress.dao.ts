// src/DAO/progress.dao.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Progress, Course } from '@prisma/client';


@Injectable()
export class ProgressDAO {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy thông tin khóa học để lấy tổng số bài học
  async findCourseById(courseId: string): Promise<{ 
    _count: { lessons: number } 
  } | null> {
    return this.prisma.course.findUnique({
      where: { id: courseId },
      select: { 
        _count: { select: { lessons: true } } 
      },
    });
  }

  // Lấy thông tin progress kèm thông tin khóa học (để lấy tên và tổng bài học)
  async findProgress(progressId: string): Promise<Progress & { course: { courseName: string; _count: { lessons: number } } } | null> {
    return this.prisma.progress.findUnique({
      where: { id: progressId },
      include: {
        course: {
          select: {
            courseName: true,
            _count: { select: { lessons: true } },
          },
        },
      },
    });
  }

  async findProgressById(progressId: string): Promise<Progress | null> {
    return this.prisma.progress.findUnique({
      where: { id: progressId },
    });
  }
  // Cập nhật progress, sử dụng transaction (tx được truyền từ service)
  async updateProgress(tx: any, progressId: string, data: { completedLessons: number; percentage: number; status: string; }) {
    return tx.progress.update({
      where: { id: progressId },
      data,
    });
  }
}
