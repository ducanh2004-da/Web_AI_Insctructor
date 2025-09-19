import { Args, Mutation, Query, Resolver, Context } from '@nestjs/graphql';
import { ProgressService } from './progress.service';
import { UpdateProgressInput } from '@/common/model/DTO/progress/progress.input';
import { ProgressResponse } from '@/common/model/DTO/progress/progress.response';
import { ForbiddenException } from '@nestjs/common/exceptions';
import { UseGuards } from '@nestjs/common';
import { AuthGuard, RolesGuard } from '../common/guards/auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthContext } from '../common/interfaces/auth.interface';

@Resolver('Progress')
@UseGuards(AuthGuard, RolesGuard)
export class ProgressResolver {
  constructor(private readonly progressService: ProgressService) {}

  @Mutation(() => ProgressResponse)
  @Roles('USER', 'ADMIN')
  async updateProgress(
    @Args('input') input: UpdateProgressInput,
    @Context() ctx: AuthContext,
  ): Promise<ProgressResponse> {
    // Ensure users can only update their own progress unless they're an admin
    if (ctx.user.role !== 'ADMIN' && input.userId !== ctx.user.id) {
      throw new ForbiddenException('You can only update your own progress');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.progressService.updateProgress(input);
  }

  @Query(() => ProgressResponse)
  @Roles('USER', 'ADMIN')
  async getProgress(
    @Args('progressId') progressId: string,
    @Context() ctx: AuthContext,
  ): Promise<ProgressResponse> {
    const progress = await this.progressService.getProgress(progressId);

    // Ensure users can only view their own progress unless they're an admin
    if (ctx.user.role !== 'ADMIN' && progress.userId !== ctx.user.id) {
      throw new ForbiddenException('You can only view your own progress');
    }

    return progress;
  }
}
