import { Args, Mutation, Query, Resolver, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ConversationService } from '../providers/conversation.service';
import { ConversationResponse } from '../DTO/conversation/conversation.response';
import {
  CreateConversationInput,
  UpdateConversationInput,
} from '../DTO/conversation/conversation.input';
import { AuthGuard, RolesGuard } from '../guards/auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { AuthContext } from '../interfaces/auth.interface';

@Resolver(() => ConversationResponse)
@UseGuards(AuthGuard, RolesGuard)
export class ConversationResolver {
  constructor(private readonly conversationService: ConversationService) {}

  @Query(() => [ConversationResponse])
  @Roles('USER', 'ADMIN')
  async myConversations(
    @Context() ctx: AuthContext,
  ): Promise<ConversationResponse[]> {
    return this.conversationService.getConversationsByUserId(ctx.user.id);
  }

  @Query(() => ConversationResponse, { nullable: true })
  @Roles('USER', 'ADMIN')
  async conversation(
    @Args('id') id: string,
    @Context() ctx: AuthContext,
  ): Promise<ConversationResponse | null> {
    const conversation = await this.conversationService.getConversationById(id);
    if (conversation && conversation.creatorId !== ctx.user.id) {
      throw new Error('Unauthorized to access this conversation');
    }
    return conversation;
  }

  @Mutation(() => ConversationResponse)
  @Roles('USER', 'ADMIN')
  async createConversation(
    @Args('data') input: CreateConversationInput,
    @Context() ctx: AuthContext,
  ): Promise<ConversationResponse> {
    return this.conversationService.createConversation({
      ...input,
      creatorId: ctx.user.id,
    });
  }

  @Mutation(() => ConversationResponse)
  @Roles('USER', 'ADMIN')
  async updateConversation(
    @Args('data') input: UpdateConversationInput,
    @Context() ctx: AuthContext,
  ): Promise<ConversationResponse> {
    const conversation = await this.conversationService.getConversationById(
      input.id,
    );
    if (!conversation || conversation.creatorId !== ctx.user.id) {
      throw new Error('Unauthorized to update this conversation');
    }
    return this.conversationService.updateConversation(input);
  }

  @Mutation(() => ConversationResponse)
  @Roles('USER', 'ADMIN')
  async deleteConversation(
    @Args('id') id: string,
    @Context() ctx: AuthContext,
  ): Promise<ConversationResponse> {
    const conversation = await this.conversationService.getConversationById(id);
    if (!conversation || conversation.creatorId !== ctx.user.id) {
      throw new Error('Unauthorized to delete this conversation');
    }
    return this.conversationService.deleteConversation(id);
  }
}
