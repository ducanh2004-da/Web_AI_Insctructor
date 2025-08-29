import {
  Args,
  Mutation,
  Query,
  Resolver,
  Context,
  Subscription,
} from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { MessageService } from '../providers/message.service';
import { MessageResponse } from '../DTO/message/message.response';
import {
  CreateMessageInput,
  UpdateMessageInput,
} from '../DTO/message/message.input';
import { AuthGuard, RolesGuard } from '../guards/auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { AuthContext } from '../interfaces/auth.interface';
import { ConversationService } from '../providers/conversation.service';
import { PubSub } from 'graphql-subscriptions';

@Resolver(() => MessageResponse)
@UseGuards(AuthGuard, RolesGuard)
export class MessageResolver {
  constructor(
    @Inject('PUB_SUB') private pubSub: PubSub,
    private readonly messageService: MessageService,
    private readonly conversationService: ConversationService,
  ) {}

  @Query(() => MessageResponse, { nullable: true })
  @Roles('USER', 'ADMIN')
  async message(
    @Args('id') id: string,
    @Context() ctx: AuthContext,
  ): Promise<MessageResponse | null> {
    const message = await this.messageService.getMessageById(id);
    if (!message) return null;

    // Check if user has access to the conversation
    const conversation = await this.conversationService.getConversationById(
      message.conversationId,
    );
    if (!conversation || conversation.creatorId !== ctx.user.id) {
      throw new Error('Unauthorized to access this message');
    }
    return message;
  }

  @Query(() => [MessageResponse])
  @Roles('USER', 'ADMIN')
  async messagesByConversation(
    @Args('conversationId') conversationId: string,
    @Context() ctx: AuthContext,
  ): Promise<MessageResponse[]> {
    // Check if user has access to the conversation
    const conversation =
      await this.conversationService.getConversationById(conversationId);
    if (!conversation || conversation.creatorId !== ctx.user.id) {
      throw new Error("Unauthorized to access this conversation's messages");
    }
    return this.messageService.getMessagesByConversationId(conversationId);
  }

  @Mutation(() => MessageResponse)
  @Roles('USER', 'ADMIN')
  async createMessage(
    @Args('data') input: CreateMessageInput,
    @Context() ctx: AuthContext,
  ): Promise<MessageResponse> {
    // Check if user has access to the conversation
    const conversation = await this.conversationService.getConversationById(
      input.conversationId,
    );
    if (!conversation || conversation.creatorId !== ctx.user.id) {
      throw new Error('Unauthorized to create message in this conversation');
    }
    return this.messageService.createMessage(input);
  }

  @Mutation(() => MessageResponse)
  @Roles('USER', 'ADMIN')
  async updateMessage(
    @Args('data') input: UpdateMessageInput,
    @Context() ctx: AuthContext,
  ): Promise<MessageResponse> {
    const message = await this.messageService.getMessageById(input.id);
    if (!message) {
      throw new Error('Message not found');
    }

    // Check if user has access to the conversation
    const conversation = await this.conversationService.getConversationById(
      message.conversationId,
    );
    if (!conversation || conversation.creatorId !== ctx.user.id) {
      throw new Error('Unauthorized to update this message');
    }
    return this.messageService.updateMessage(input);
  }

  @Mutation(() => MessageResponse)
  @Roles('USER', 'ADMIN')
  async deleteMessage(
    @Args('id') id: string,
    @Context() ctx: AuthContext,
  ): Promise<MessageResponse> {
    const message = await this.messageService.getMessageById(id);
    if (!message) {
      throw new Error('Message not found');
    }

    // Check if user has access to the conversation
    const conversation = await this.conversationService.getConversationById(
      message.conversationId,
    );
    if (!conversation || conversation.creatorId !== ctx.user.id) {
      throw new Error('Unauthorized to delete this message');
    }
    return this.messageService.deleteMessage(id);
  }

  // Add a subscription for real-time updates
  @Subscription(() => MessageResponse, {
    filter: (payload, variables) => {
      return payload.messageAdded.conversationId === variables.conversationId;
    },
  })
  @Roles('USER', 'ADMIN')
  messageAdded(@Args('conversationId') conversationId: string) {
    // Use type assertion to fix the TypeScript error
    return (this.pubSub as any).asyncIterator(`message.${conversationId}`);
  }
}
