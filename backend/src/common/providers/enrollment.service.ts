// enrollment.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EnrollmentDAO } from '../DAO/enrollment.dao';
import { CreateEnrollmentInput } from '../DTO/enrollment/enrollment.input';
import { EnrollmentResponse } from '../DTO/enrollment/enrollment.response';

@Injectable()
export class EnrollmentService {
  constructor(private readonly enrollmentDAO: EnrollmentDAO) {}

  async enrollUserToCourse(
    input: CreateEnrollmentInput,
  ): Promise<EnrollmentResponse> {
    const { userId, courseId, totalLessons } = input;

    const [user, course] = await Promise.all([
      this.enrollmentDAO.findUserById(userId),
      this.enrollmentDAO.findCourseById(courseId),
    ]);

    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
    if (!course)
      throw new NotFoundException(`Course with ID ${courseId} not found`);

    const existingEnrollment = await this.enrollmentDAO.findEnrollment(
      userId,
      courseId,
    );
    if (existingEnrollment)
      throw new ConflictException('User already enrolled in this course');

    const enrollment = await this.enrollmentDAO.createEnrollment(
      userId,
      courseId,
    );
    await this.enrollmentDAO.createProgress(userId, courseId, totalLessons);

    return enrollment;
  }

  async getUserEnrollments(userId: string): Promise<EnrollmentResponse[]> {
    const enrollments = await this.enrollmentDAO.getUserEnrollments(userId);
    if (!enrollments.length)
      throw new NotFoundException(
        `No enrollments found for user ID: ${userId}`,
      );

    return enrollments.map((enrollment) => ({
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      enrolledAt: enrollment.enrolledAt,
    }));
  }
}
