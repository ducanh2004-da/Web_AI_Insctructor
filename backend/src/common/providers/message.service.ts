import { Injectable, Inject } from '@nestjs/common';
import { MessageDAO } from '../DAO/message.dao';
import {
  CreateMessageInput,
  UpdateMessageInput,
} from '../DTO/message/message.input';
import { MessageResponse } from '../DTO/message/message.response';
import { plainToClass } from 'class-transformer';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { SenderType } from '@prisma/client';
import { PubSub } from 'graphql-subscriptions';

interface AIApiResponse {
  result: string;
}

@Injectable()
export class MessageService {
  constructor(
    private readonly messageDAO: MessageDAO,
    private readonly httpService: HttpService,
    @Inject('PUB_SUB') private pubSub: PubSub,
  ) {}

  async createMessage(input: CreateMessageInput): Promise<MessageResponse> {
    const message = await this.messageDAO.createMessage({
      content: input.content,
      senderType: SenderType.USER,
      conversationId: input.conversationId,
    });

    // Publish the user message to subscribers
    const userMessageResponse = plainToClass(MessageResponse, message);
    await this.pubSub.publish(`message.${input.conversationId}`, {
      messageAdded: userMessageResponse,
    });

    const response = await firstValueFrom(
      // Replace with actual AI API endpoint
      this.httpService.post<AIApiResponse>(`${process.env.AI_URL}/ask`, {
        question: input.content,
        course_id: input.courseId,
        lesson_id: input.lessonId,
      }),
    );

    // Create AI response message
    const aiMessage = await this.messageDAO.createMessage({
      content: response.data.result,
      senderType: SenderType.AI,
      conversationId: input.conversationId,
    });

    // Publish the AI message to subscribers
    const aiMessageResponse = plainToClass(MessageResponse, aiMessage);
    await this.pubSub.publish(`message.${input.conversationId}`, {
      messageAdded: aiMessageResponse,
    });

    return aiMessageResponse;
  }

  async getMessageById(id: string): Promise<MessageResponse | null> {
    const message = await this.messageDAO.getMessageById(id);
    if (!message) return null;
    return plainToClass(MessageResponse, message);
  }

  async getMessagesByConversationId(
    conversationId: string,
  ): Promise<MessageResponse[]> {
    const messages =
      await this.messageDAO.getMessagesByConversationId(conversationId);
    return messages.map((message) => plainToClass(MessageResponse, message));
  }

  async updateMessage(input: UpdateMessageInput): Promise<MessageResponse> {
    const message = await this.messageDAO.updateMessage(input.id, {
      content: input.content,
    });
    return plainToClass(MessageResponse, message);
  }

  async deleteMessage(id: string): Promise<MessageResponse> {
    const message = await this.messageDAO.deleteMessage(id);
    return plainToClass(MessageResponse, message);
  }

  async deleteMessagesByConversationId(
    conversationId: string,
  ): Promise<number> {
    return this.messageDAO.deleteMessagesByConversationId(conversationId);
  }
}
