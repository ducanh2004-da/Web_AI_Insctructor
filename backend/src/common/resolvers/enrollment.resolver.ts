import { Args, Mutation, Query, Resolver, Context } from '@nestjs/graphql';
import { EnrollmentService } from '../providers/enrollment.service';
import { CreateEnrollmentInput } from '../DTO/enrollment/enrollment.input';
import { EnrollmentResponse } from '../DTO/enrollment/enrollment.response';
import { UseGuards } from '@nestjs/common';
import { AuthGuard, RolesGuard } from '../guards/auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { AuthContext } from '../interfaces/auth.interface';

@Resolver(() => EnrollmentResponse)
@UseGuards(AuthGuard, RolesGuard)
export class EnrollmentResolver {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Mutation(() => EnrollmentResponse)
  @Roles('USER', 'ADMIN')
  async enrollCourse(
    @Args('input') input: CreateEnrollmentInput,
    @Context() ctx: AuthContext,
  ): Promise<EnrollmentResponse> {
    // Ensure users can only enroll themselves unless they're an admin
    if (ctx.user.role !== 'ADMIN' && input.userId !== ctx.user.id) {
      throw new Error('You can only enroll yourself in courses');
    }
    return this.enrollmentService.enrollUserToCourse(input);
  }

  @Query(() => [EnrollmentResponse])
  @Roles('USER', 'ADMIN')
  async getUserEnrollments(
    @Args('userId') userId: string,
    @Context() ctx: AuthContext,
  ): Promise<EnrollmentResponse[]> {
    // Users can only view their own enrollments unless they're an admin
    if (ctx.user.role !== 'ADMIN' && userId !== ctx.user.id) {
      throw new Error('You can only view your own enrollments');
    }
    return this.enrollmentService.getUserEnrollments(userId);
  }
}
