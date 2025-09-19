// enrollment.dao.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Enrollment, Progress, User, Course } from '@prisma/client';

@Injectable()
export class EnrollmentDAO {
  constructor(private readonly prisma: PrismaService) {}

  async findUserById(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async findCourseById(courseId: string): Promise<Course | null> {
    return this.prisma.course.findUnique({ where: { id: courseId } });
  }

  async findEnrollment(userId: string, courseId: string): Promise<Enrollment | null> {
    return this.prisma.enrollment.findFirst({ where: { userId, courseId } });
  }

  async createEnrollment(userId: string, courseId: string): Promise<Enrollment> {
    return this.prisma.enrollment.create({ data: { userId, courseId } });
  }

  async createProgress(userId: string, courseId: string, totalLessons: number): Promise<Progress> {
    return this.prisma.progress.create({ data: { userId, courseId, percentage: 0, completedLessons: 0, totalLessons } });
  }

  async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    return this.prisma.enrollment.findMany({ where: { userId }, include: { course: true } });
  }
}