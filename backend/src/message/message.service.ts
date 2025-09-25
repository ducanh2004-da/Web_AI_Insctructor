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
  ) { }

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
  // Lưu user input (giữ nguyên)
  await this.messageDAO.createMessage({
    content: data.message,
    senderType: SenderType.USER,
    conversationId: data.conversationId,
  });

  const { message, sessionId, fileBase64, filename } = data;
  const url = 'https://chatbot-e5xc.onrender.com/chat';

  const FormData = require('form-data');
  const form = new FormData();
  if (message) form.append('message', message);
  if (fileBase64 && filename) {
    const fileBuffer = Buffer.from(fileBase64, 'base64');
    form.append('file', fileBuffer, { filename });
  }

  const headers: Record<string, any> = {
    Accept: 'text/event-stream',
  };
  if (sessionId) headers.Cookie = `session_id=${sessionId}`;

  const response: AxiosResponse = await this.httpService.axiosRef.post(url, form, {
    headers: {
      ...headers,
      ...form.getHeaders(),
    },
    responseType: 'stream',
  });

  const stream = response.data as NodeJS.ReadableStream;

  // --- giữ nguyên accumulated raw string ---
  let accumulated = '';

  await new Promise<void>((resolve, reject) => {
    stream.on('data', (chunk: Buffer) => {
      const str = chunk.toString('utf-8');
      // debug: in case you want to see chunk in console
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

  // --- parse accumulated để lấy mọi giá trị "response" ---
  // helper đệ quy lấy tất cả các field 'response' từ object/array
  const collectResponses = (obj: any): string[] => {
    const out: string[] = [];
    if (obj == null) return out;

    if (Array.isArray(obj)) {
      for (const el of obj) out.push(...collectResponses(el));
      return out;
    }

    if (typeof obj === 'object') {
      if (typeof obj.response === 'string') out.push(obj.response);

      for (const k of Object.keys(obj)) {
        const v = obj[k];
        if (v == null) continue;
        if (typeof v === 'string') {
          const s = v.trim();
          // nếu string chứa JSON (stringified), parse tiếp
          if ((s.startsWith('{') && s.endsWith('}')) || (s.startsWith('[') && s.endsWith(']'))) {
            try {
              const parsed = JSON.parse(s);
              out.push(...collectResponses(parsed));
            } catch {
              // không phải JSON -> ignore
            }
          } else {
            // không parse, nhưng có thể chữ thuần text (không chứa response key) -> ignore
          }
        } else if (typeof v === 'object') {
          out.push(...collectResponses(v));
        }
      }
      return out;
    }

    // nếu là string đơn giản, không xử lý ở đây
    return out;
  };

  // 1) Tìm các block "data: {...}" theo spec SSE và parse JSON bên trong
  const parts: string[] = [];
  try {
    const dataObjRegex = /data:\s*({[\s\S]*?})(?=(?:\r?\n|$))/g;
    let m: RegExpExecArray | null;
    while ((m = dataObjRegex.exec(accumulated)) !== null) {
      const jsonText = m[1];
      try {
        const parsed = JSON.parse(jsonText);
        parts.push(...collectResponses(parsed));
      } catch {
        // nếu không parse được, cố tìm "response": "..." bằng regex trong jsonText
        const respRegex = /"response"\s*:\s*"((?:\\.|[^"\\])*)"/g;
        let mm: RegExpExecArray | null;
        while ((mm = respRegex.exec(jsonText)) !== null) {
          // unescape quotes
          parts.push(mm[1].replace(/\\"/g, '"'));
        }
      }
    }
  } catch (err) {
    // ignore parse errors
  }

  // 2) Nếu không tìm thấy data: {...} hoặc vẫn còn response rời rạc,
  //    tìm mọi "response":"..." xuất hiện trong toàn accumulated
  try {
    const respRegexAll = /"response"\s*:\s*"((?:\\.|[^"\\])*)"/g;
    let mm: RegExpExecArray | null;
    while ((mm = respRegexAll.exec(accumulated)) !== null) {
      parts.push(mm[1].replace(/\\"/g, '"'));
    }
  } catch (err) {
    // ignore
  }

  // 3) Ngoài ra cố parse toàn accumulated thành JSON nếu nó là 1 array/object JSON
  //    (ví dụ server trả nhiều object json nối nhau)
  if (parts.length === 0) {
    try {
      const parsedAll = JSON.parse(accumulated);
      parts.push(...collectResponses(parsedAll));
    } catch {
      // ignore
    }
  }

  // final fallback: nếu vẫn rỗng, lưu raw accumulated (hoặc có thể tách theo newline)
  let fullText = '';
  if (parts.length > 0) {
    // ghép các phần lại - bạn có thể đổi separator nếu muốn
    fullText = parts.join('');
  } else {
    // fallback: dùng accumulated raw (sạch hơn) - mình khử các tag "data:" nếu có
    // remove leading "data: " prefixes and SSE separators
    const cleaned = accumulated
      .replace(/(^data:\s*)/gm, '')
      .replace(/\r?\n\r?\n/g, '\n') // collapse event separators
      .trim();
    fullText = cleaned;
  }

  // optional: tidy up whitespace
  fullText = fullText.replace(/\s{2,}/g, ' ').trim();

  // --- Lưu vào DB: lưu fullText (toàn bộ văn bản đã ghép) ---
  await this.messageDAO.createMessage({
    content: fullText,
    senderType: SenderType.AI,
    conversationId: data.conversationId,
  });

  // --- TRẢ VỀ: giữ nguyên accumulated raw (như bạn muốn) ---
  return {
    type: 'success',
    message: 'Stream finished',
    response: accumulated, // raw stream (unchanged)
    agent: 'fastapi',
  };
}



}
