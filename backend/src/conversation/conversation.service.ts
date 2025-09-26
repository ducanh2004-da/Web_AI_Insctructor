import { Injectable } from '@nestjs/common';
import { ConversationDAO } from '@/conversation/conversation.dao';
import {
  CreateConversationInput,
  UpdateConversationInput,
} from '@/common/model/DTO/conversation/conversation.input';
import { ConversationResponse } from '@/common/model/DTO/conversation/conversation.response';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ConversationService {
  constructor(private readonly conversationDAO: ConversationDAO) {}

  async createConversation(
    input: CreateConversationInput,
  ): Promise<ConversationResponse> {
    const conversation = await this.conversationDAO.createConversation({
      name: input.name,
      creatorId: input.creatorId,
    });
    return plainToClass(ConversationResponse, conversation);
  }

  async getConversationById(id: string): Promise<ConversationResponse | null> {
    const conversation = await this.conversationDAO.getConversationById(id);
    if (!conversation) return null;
    return plainToClass(ConversationResponse, conversation);
  }

  async getConversationsByUserId(
    userId: string,
  ): Promise<ConversationResponse[]> {
    const conversations =
      await this.conversationDAO.getConversationsByUserId(userId);
    return conversations.map((conversation) =>
      plainToClass(ConversationResponse, conversation),
    );
  }

  async getAllConversations(): Promise<ConversationResponse[]> {
    const conversations = await this.conversationDAO.getAllConversations();
    return conversations.map((conversation) =>
      plainToClass(ConversationResponse, conversation),
    );
  }

  async updateConversation(
    input: UpdateConversationInput,
  ): Promise<ConversationResponse> {
    const conversation = await this.conversationDAO.updateConversation(
      input.id,
      { name: input.name },
    );
    return plainToClass(ConversationResponse, conversation);
  }

  async deleteConversation(id: string): Promise<ConversationResponse> {
    const conversation = await this.conversationDAO.deleteConversation(id);
    return plainToClass(ConversationResponse, conversation);
  }
}
