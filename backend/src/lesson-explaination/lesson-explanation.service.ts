import { Injectable } from '@nestjs/common';
import { LessonExplanationDAO } from '@/lesson-explaination/lesson-explanation.dao';
import {
  CreateLessonExplanationInput,
  UpdateLessonExplanationInput,
} from '@/common/model/DTO/lesson-explanation/lesson-explanation.input';
import { LessonExplanationResponse } from '@/common/model/DTO/lesson-explanation/lesson-explanation.response';
import { plainToClass } from 'class-transformer';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';

interface PDFRewriteResponse {
  rewritten_text: string;
}

@Injectable()
export class LessonExplanationService {
  constructor(
    private readonly lessonExplanationDAO: LessonExplanationDAO,
    private readonly httpService: HttpService,
  ) {}

  async createLessonExplanation(
    input: CreateLessonExplanationInput,
  ): Promise<LessonExplanationResponse> {
    try {
      // Xử lý URL đúng cách
      const baseUrl = process.env.AI_URL?.endsWith('/')
        ? process.env.AI_URL.slice(0, -1)
        : process.env.AI_URL;
      
      // Sử dụng axios trực tiếp thay vì httpService
      const response = await axios.post<PDFRewriteResponse>(
        `${baseUrl}/rewrite-pdf-emotion`,
        {
          emotion: input.emotion,
          course_id: input.courseId,
          lesson_id: input.lessonId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );
      
      console.log(response.data.rewritten_text);
      
      // Create explanation with the API response
      const explanation =
        await this.lessonExplanationDAO.createLessonExplanation({
          content: response.data.rewritten_text,
          emotion: input.emotion,
          lessonId: input.lessonId,
          userId: input.userId,
        });

      return plainToClass(LessonExplanationResponse, explanation);
    } catch (error) {
      console.error('Error getting PDF rewrite:', error);
      throw new Error('Failed to generate lesson explanation');
    }
  }

  async getLessonExplanationById(
    id: string,
  ): Promise<LessonExplanationResponse | null> {
    const explanation =
      await this.lessonExplanationDAO.getLessonExplanationById(id);
    if (!explanation) return null;
    return plainToClass(LessonExplanationResponse, explanation);
  }

  async getLessonExplanationByLessonAndUser(
    lessonId: string,
    userId: string,
  ): Promise<LessonExplanationResponse | null> {
    const explanation =
      await this.lessonExplanationDAO.getLessonExplanationByLessonAndUser(
        lessonId,
        userId,
      );
    if (!explanation) return null;
    return plainToClass(LessonExplanationResponse, explanation);
  }

  async updateLessonExplanation(
    input: UpdateLessonExplanationInput,
  ): Promise<LessonExplanationResponse> {
    const explanation = await this.lessonExplanationDAO.updateLessonExplanation(
      input.id,
      { content: input.content },
    );
    return plainToClass(LessonExplanationResponse, explanation);
  }

  async deleteLessonExplanation(
    id: string,
  ): Promise<LessonExplanationResponse> {
    const explanation =
      await this.lessonExplanationDAO.deleteLessonExplanation(id);
    return plainToClass(LessonExplanationResponse, explanation);
  }
}
