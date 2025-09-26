import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { SystemPromptService } from './system-prompt.service';
import { SystemPromptResponse } from '@/common/model/DTO/systemPrompt/systemPrompt.response';
import { CreateSystemPromptInput, UpdateSystemPromptInput } from '@/common/model/DTO/systemPrompt/systemPrompt.input';


@Resolver(() => SystemPromptResponse)
export class SystemPromptResolver {
  constructor(private readonly systemPromptService: SystemPromptService) {}

  @Query(() => [SystemPromptResponse], { name: 'systemPrompts' })
  async findAll() {
    return this.systemPromptService.findAll();
  }

  @Query(() => SystemPromptResponse, { name: 'systemPrompt' })
  async findOne(@Args('id', { type: () => String }) id: string) {
    return this.systemPromptService.findOne(id);
  }

  @Mutation(() => SystemPromptResponse, { name: 'createSystemPrompt' })
  async create(
    @Args('data', { type: () => CreateSystemPromptInput }) data: CreateSystemPromptInput,
  ) {
    return this.systemPromptService.create(data);
  }

@Mutation(() => SystemPromptResponse, { name: 'updateSystemPrompt' })
async update(
  @Args('id', { type: () => String }) id: string, // Thêm argument id
  @Args('data') data: UpdateSystemPromptInput,
) {
  return this.systemPromptService.update(id, data);
}

  @Mutation(() => Boolean, { name: 'deleteSystemPrompt' })
  async delete(@Args('id', { type: () => String }) id: string) {
    return this.systemPromptService.delete(id);
  }
}

