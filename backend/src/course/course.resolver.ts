import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CourseService } from './course.service';
import { CourseDto } from '@/common/model/DTO/cousre/course.dto';
import { CreateCourseDto } from '@/common/model/DTO/cousre/create-course.dto';
import { UpdateCourseDto } from '@/common/model/DTO/cousre/update-course.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard, RolesGuard } from '../common/guards/auth.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Resolver(() => CourseDto)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Query(() => [CourseDto])
  async getAllCourses(): Promise<CourseDto[]> {
    const courses = await this.courseService.getAllCourses();
    return courses.map((course) => ({
      ...course,
      abstract: course.abstract,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      keyLearnings: course.keyLearnings || [],
    }));
  }

  @Query(() => CourseDto, { nullable: true })
  async getCourseById(
    @Args('id', { type: () => String }) id: string,
  ): Promise<CourseDto | null> {
    const course = await this.courseService.getCourseById(id);
    if (!course) return null;
    return {
      ...course,
      keyLearnings: course.keyLearnings || [],
    };
  }

  @Mutation(() => CourseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createCourse(@Args('data') data: CreateCourseDto): Promise<CourseDto> {
    const course = await this.courseService.createCourse(data);
    return {
      ...course,
      keyLearnings: course.keyLearnings || [],
    };
  }

  @Mutation(() => CourseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateCourse(@Args('data') data: UpdateCourseDto): Promise<CourseDto> {
    const course = await this.courseService.updateCourse(data);
    return {
      ...course,
      keyLearnings: course.keyLearnings || [],
    };
  }

  @Mutation(() => CourseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteCourse(@Args('id') id: string): Promise<CourseDto> {
    const course = await this.courseService.deleteCourse(id);
    return {
      ...course,
      keyLearnings: course.keyLearnings || [],
    };
  }
}
