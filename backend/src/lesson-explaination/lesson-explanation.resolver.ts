import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { LessonExplanationService } from './lesson-explanation.service';
import { LessonExplanationResponse } from '@/common/model/DTO/lesson-explanation/lesson-explanation.response';
import {
  CreateLessonExplanationInput,
  UpdateLessonExplanationInput,
} from '@/common/model/DTO/lesson-explanation/lesson-explanation.input';
import { AuthGuard, RolesGuard } from '../common/guards/auth.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Resolver(() => LessonExplanationResponse)
@UseGuards(AuthGuard, RolesGuard)
export class LessonExplanationResolver {
  constructor(
    private readonly lessonExplanationService: LessonExplanationService,
  ) {}

  @Query(() => LessonExplanationResponse, { nullable: true })
  @Roles('USER', 'ADMIN')
  async lessonExplanation(
    @Args('id') id: string,
  ): Promise<LessonExplanationResponse | null> {
    return this.lessonExplanationService.getLessonExplanationById(id);
  }

  @Query(() => LessonExplanationResponse, { nullable: true })
  @Roles('USER', 'ADMIN')
  async lessonExplanationByLessonAndUser(
    @Args('lessonId') lessonId: string,
    @Args('userId') userId: string,
  ): Promise<LessonExplanationResponse | null> {
    return this.lessonExplanationService.getLessonExplanationByLessonAndUser(
      lessonId,
      userId,
    );
  }

  @Mutation(() => LessonExplanationResponse)
  @Roles('USER', 'ADMIN')
  async createLessonExplanation(
    @Args('data') input: CreateLessonExplanationInput,
  ): Promise<LessonExplanationResponse> {
    return this.lessonExplanationService.createLessonExplanation(input);
  }

  @Mutation(() => LessonExplanationResponse)
  @Roles('USER', 'ADMIN')
  async updateLessonExplanation(
    @Args('data') input: UpdateLessonExplanationInput,
  ): Promise<LessonExplanationResponse> {
    return this.lessonExplanationService.updateLessonExplanation(input);
  }

  @Mutation(() => LessonExplanationResponse)
  @Roles('USER', 'ADMIN')
  async deleteLessonExplanation(
    @Args('id') id: string,
  ): Promise<LessonExplanationResponse> {
    return this.lessonExplanationService.deleteLessonExplanation(id);
  }
}
