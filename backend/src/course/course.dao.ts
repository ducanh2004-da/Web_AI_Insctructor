import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { Course } from '@prisma/client';

@Injectable()
export class CourseDAO {
  constructor(private readonly prisma: PrismaService) {}

  async createCourse(data: {
    courseName: string;
    abstract: string | null;
  }): Promise<Course> {
    return this.prisma.course.create({
      data,
    });
  }

  async getCourseById(id: string): Promise<Course | null> {
    return this.prisma.course.findUnique({
      where: { id },
      include: {
        lessons: true,
        enrollments: true,
        progress: true,
      },
    });
  }

  async getAllCourses(): Promise<Course[]> {
    return this.prisma.course.findMany({
      include: {
        lessons: true,
        enrollments: true,
        progress: true,
      },
    });
  }

  async updateCourse(id: string, data: Partial<Course>): Promise<Course> {
    return this.prisma.course.update({
      where: { id },
      data,
    });
  }

  async deleteCourse(id: string): Promise<Course> {
    return this.prisma.course.delete({
      where: { id },
    });
  }
}
