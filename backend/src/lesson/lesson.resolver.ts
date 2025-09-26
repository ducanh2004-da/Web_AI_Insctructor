import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { LessonService } from './lesson.service';
import { LessonDto } from '@/common/model/DTO/lesson/lesson.dto';
import { CreateLessonDto } from '@/common/model/DTO/lesson/create-lesson.dto';
import { UpdateLessonDto } from '@/common/model/DTO/lesson/update-lesson.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard, RolesGuard } from '../common/guards/auth.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Resolver(() => LessonDto)
export class LessonResolver {
  constructor(private readonly lessonService: LessonService) {}

  @Query(() => [LessonDto])
  async getAllLessons(): Promise<LessonDto[]> {
    const lessons = await this.lessonService.getAllLessons();
    return lessons.map((lesson) => ({
      ...lesson,
      abstract: lesson.abstract,
    }));
  }

  @Query(() => [LessonDto])
  async getLessonsByCourseId(
    @Args('id', { type: () => String }) id: string,
  ): Promise<LessonDto[]> {
    return this.lessonService.getLessonsByCourseId(id);
  }

  @Query(() => LessonDto, { nullable: true })
  async getLessonById(
    @Args('id', { type: () => String }) id: string,
  ): Promise<LessonDto | null> {
    return this.lessonService.getLessonById(id);
  }

  @Mutation(() => LessonDto)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createLesson(@Args('data') data: CreateLessonDto): Promise<LessonDto> {
    return this.lessonService.createLesson(data);
  }

  @Mutation(() => LessonDto)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateLesson(@Args('data') data: UpdateLessonDto): Promise<LessonDto> {
    return this.lessonService.updateLesson(data);
  }

  @Mutation(() => LessonDto)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteLesson(
    @Args('id', { type: () => String }) id: string,
  ): Promise<LessonDto> {
    return this.lessonService.deleteLesson(id);
  }

  @Mutation(() => LessonDto)
  @UseGuards(AuthGuard)
  async markDone(
    @Args('id', { type: () => String }) id: string,
    @Args('isDone', { type: () => Boolean }) isDone: boolean,
  ): Promise<LessonDto> {
    return this.lessonService.markDone(id, isDone);
  }
}
