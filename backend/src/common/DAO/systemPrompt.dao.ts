import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { SystemPrompt } from '@prisma/client';
import { UpdateSystemPromptInput } from '@/common/DTO/systemPrompt/systemPrompt.input';

@Injectable()
export class SystemPromptDAO {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<SystemPrompt[]> {
    return this.prisma.systemPrompt.findMany();
  }

  async findOne(id: string): Promise<SystemPrompt | null> {
    return this.prisma.systemPrompt.findUnique({ where: { id } });
  }

  async create(data: {
    title: string;
    content: string;
    aiId: string;
  }): Promise<SystemPrompt> {
    return this.prisma.systemPrompt.create({ data });
  }

async update(
    id: string,
    data: {
      title?: string; // Thêm dấu ? để thành optional
      content?: string;
    },
  ): Promise<SystemPrompt> {
    return this.prisma.systemPrompt.update({
      where: { id },
      data,
    });
}

  async delete(id: string): Promise<void> {
    await this.prisma.systemPrompt.delete({ where: { id } });
  }
}

