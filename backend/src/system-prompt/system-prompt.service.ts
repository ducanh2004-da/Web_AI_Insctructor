import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { CreateSystemPromptInput, UpdateSystemPromptInput } from '@/common/model/DTO/systemPrompt/systemPrompt.input';
  import { SystemPromptResponse } from '@/common/model/DTO/systemPrompt/systemPrompt.response';
  import { SystemPromptDAO } from './systemPrompt.dao';
  import { SystemPrompt } from '@prisma/client';
  
  @Injectable()
  export class SystemPromptService {
    // Thêm AI ID mặc định
    private readonly DEFAULT_AI_ID = 'clx4abcdefg12345'; // Thay bằng AI ID thực tế
  
    constructor(private systemPromptDAO: SystemPromptDAO) {}
  
    async findAll(): Promise<SystemPromptResponse[]> {
      const systemPrompts = await this.systemPromptDAO.findAll();
      return systemPrompts.map(this.formatResponse);
    }
  
    async findOne(id: string): Promise<SystemPromptResponse> {
      const systemPrompt = await this.systemPromptDAO.findOne(id);
      if (!systemPrompt) {
        throw new NotFoundException(`SystemPrompt with ID ${id} not found`);
      }
      return this.formatResponse(systemPrompt);
    }
  
    private formatResponse(prompt: SystemPrompt): SystemPromptResponse {
      return {
        id: prompt.id,
        title: prompt.title,
        content: prompt.content,
        createdAt: prompt.createdAt,
      };
    }
  
    async create(data: CreateSystemPromptInput): Promise<SystemPromptResponse> {
      // Kiểm tra title trùng lặp
      const existingPrompt = await this.systemPromptDAO.findAll()
        .then(prompts => prompts.find(p => p.title === data.title));
  
      if (existingPrompt) {
        throw new BadRequestException(
          `Title '${data.title}' already exists`
        );
      }
  
      const newPrompt = await this.systemPromptDAO.create({
        title: data.title,
        content: data.content,
        aiId: '12345' // Tự động gán AI ID
      });
  
      return this.formatResponse(newPrompt);
    }
  
    async update(
        id: string,
        data: UpdateSystemPromptInput,
      ): Promise<SystemPromptResponse> {
        const existingPrompt = await this.systemPromptDAO.findOne(id);
        if (!existingPrompt) {
          throw new NotFoundException(`SystemPrompt with ID ${id} not found`);
        }
      
        // Tạo payload update chỉ chứa các field được define trong DAO
        const updatePayload: Parameters<SystemPromptDAO['update']>[1] = {};
      
        if (data.title) {
          if (data.title !== existingPrompt.title) {
            const duplicateTitle = await this.systemPromptDAO.findAll()
              .then(prompts => prompts.some(p => p.title === data.title));
            
            if (duplicateTitle) {
              throw new BadRequestException(`Title '${data.title}' already exists`);
            }
          }
          updatePayload.title = data.title;
        }
      
        if (data.content) {
          updatePayload.content = data.content;
        }
      
        if (Object.keys(updatePayload).length === 0) {
          throw new BadRequestException('No fields to update');
        }
      
        const updatedPrompt = await this.systemPromptDAO.update(
          id, 
          updatePayload // Đảm bảo type chính xác
        );
      
        return this.formatResponse(updatedPrompt);
      }
  
    async delete(id: string): Promise<boolean> {
      const prompt = await this.systemPromptDAO.findOne(id);
      if (!prompt) {
        throw new NotFoundException(`SystemPrompt with ID ${id} not found`);
      }
      await this.systemPromptDAO.delete(id);
      return true;
    }
  }