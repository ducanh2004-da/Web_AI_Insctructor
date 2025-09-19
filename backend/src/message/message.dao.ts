import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { Message, SenderType } from '@prisma/client';

@Injectable()
export class MessageDAO {
  constructor(private readonly prisma: PrismaService) {}

  async createMessage(data: {
    content: string;
    senderType: SenderType;
    conversationId: string;
  }): Promise<Message> {
    return this.prisma.message.create({
      data,
      include: {
        conversation: true,
      },
    });
  }

  async getMessageById(id: string): Promise<Message | null> {
    return this.prisma.message.findUnique({
      where: { id },
      include: {
        conversation: true,
      },
    });
  }

  async getMessagesByConversationId(
    conversationId: string,
  ): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: { conversationId },
      include: {
        conversation: true,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });
  }

  async updateMessage(id: string, data: Partial<Message>): Promise<Message> {
    return this.prisma.message.update({
      where: { id },
      data,
      include: {
        conversation: true,
      },
    });
  }

  async deleteMessage(id: string): Promise<Message> {
    return this.prisma.message.delete({
      where: { id },
    });
  }

  async deleteMessagesByConversationId(
    conversationId: string,
  ): Promise<number> {
    const result = await this.prisma.message.deleteMany({
      where: { conversationId },
    });
    return result.count;
  }
}
