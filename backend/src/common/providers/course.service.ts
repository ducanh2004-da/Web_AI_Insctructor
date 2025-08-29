import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { CourseDAO } from '../DAO/course.dao';
import { CreateCourseDto } from '../DTO/cousre/create-course.dto';
import { UpdateCourseDto } from '../DTO/cousre/update-course.dto';
import { Course } from '@prisma/client';

@Injectable()
export class CourseService {
  constructor(private readonly courseDAO: CourseDAO) {}

  async createCourse(data: CreateCourseDto): Promise<Course> {
    return this.courseDAO.createCourse({
      ...data,
      abstract: data.abstract ?? null,
    });
  }

  async getCourseById(id: string): Promise<Course | null> {
    return this.courseDAO.getCourseById(id);
  }

  async getAllCourses(): Promise<Course[]> {
    return this.courseDAO.getAllCourses();
  }

  async updateCourse(data: UpdateCourseDto): Promise<Course> {
    return this.courseDAO.updateCourse(data.id, data);
  }

  async deleteCourse(id: string): Promise<Course> {
    return this.courseDAO.deleteCourse(id);
  }
}
