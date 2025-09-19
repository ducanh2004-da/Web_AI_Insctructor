import { Injectable, Inject } from '@nestjs/common';
import { MessageDAO } from '@/message/message.dao';
import {
  CreateMessageInput,
  UpdateMessageInput,
  CreateMessage2Input
} from '@/common/model/DTO/message/message.input';
import { MessageResponse } from '@/common/model/DTO/message/message.response';
import { plainToClass } from 'class-transformer';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { SenderType } from '@prisma/client';
import { PubSub } from 'graphql-subscriptions';
import { AxiosResponse } from 'axios';
import { Stream } from 'stream';

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

  async streamChatFromFastApi(data: CreateMessage2Input): Promise<MessageResponse> {
      // Lấy từ input
      const { message, sessionId, fileBase64, filename } = data;
  
      const url = 'https://chatbot-e5xc.onrender.com/chat'; // endpoint FastAPI
  
      // Prepare form-data nếu cần file, otherwise just send text field
      const FormData = require('form-data');
      const form = new FormData();
  
      if (message) form.append('message', message);
  
      if (fileBase64 && filename) {
        const fileBuffer = Buffer.from(fileBase64, 'base64');
        // append file, axios will handle content-type boundary via form.getHeaders()
        form.append('file', fileBuffer, { filename });
      }
  
      // headers: don't override Content-Type; use form.getHeaders()
      const headers: Record<string, any> = {
        Accept: 'text/event-stream', // nếu FastAPI trả SSE
      };
      if (sessionId) headers.Cookie = `session_id=${sessionId}`;
  
      // Gọi axios để nhận response stream
      const response: AxiosResponse<Stream> = await this.httpService.axiosRef.post(
        url,
        form,
        {
          headers: {
            ...headers,
            ...form.getHeaders(),
          },
          responseType: 'stream',
        },
      );
  
      const stream = response.data;
  
      // Gom các chunk trả về (đơn giản) — bạn có thể parse SSE nếu cần
      let accumulated = '';
  
      await new Promise<void>((resolve, reject) => {
        stream.on('data', (chunk: Buffer) => {
          const str = chunk.toString('utf-8');
          // Nếu FastAPI trả SSE, các event có thể kèm "data: ..."
          // Bạn có thể parse theo spec SSE. Ở đây ta ghi log và gom nội dung.
          process.stdout.write(str);
          accumulated += str;
        });
  
        stream.on('end', () => {
          console.log('Stream ended');
          resolve();
        });
  
        stream.on('error', (err) => {
          console.error('Stream error', err);
          reject(err);
        });
      });
  
      // Trả về Response model (tùy chỉnh)
      return {
        type: 'success',
        message: 'Stream finished',
        response: accumulated,
        agent: 'fastapi',
      };
    }

}
