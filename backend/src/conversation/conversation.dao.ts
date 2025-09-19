import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { Conversation } from '@prisma/client';

@Injectable()
export class ConversationDAO {
  constructor(private readonly prisma: PrismaService) {}

  async createConversation(data: {
    name?: string;
    creatorId: string;
  }): Promise<Conversation> {
    return this.prisma.conversation.create({
      data,
      include: {
        messages: true,
        creator: true,
      },
    });
  }

  async getConversationById(id: string): Promise<Conversation | null> {
    return this.prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: true,
        creator: true,
      },
    });
  }
  async getConversationByUserId(userId: string): Promise<Conversation[]> {
    return this.prisma.conversation.findMany({
      where: {
        creatorId: userId,
      },
      include: {
        messages: true,
        creator: true,
      },
    });
  }

  async getAllConversations(): Promise<Conversation[]> {
    return this.prisma.conversation.findMany({
      include: {
        messages: true,
        creator: true,
      },
    });
  }

  async getConversationsByUserId(creatorId: string): Promise<Conversation[]> {
    return this.prisma.conversation.findMany({
      where: { creatorId },
      include: {
        messages: true,
        creator: true,
      },
    });
  }

  async updateConversation(
    id: string,
    data: Partial<Conversation>,
  ): Promise<Conversation> {
    return this.prisma.conversation.update({
      where: { id },
      data,
      include: {
        messages: true,
        creator: true,
      },
    });
  }

  async deleteConversation(id: string): Promise<Conversation> {
    return this.prisma.conversation.delete({
      where: { id },
    });
  }
}
