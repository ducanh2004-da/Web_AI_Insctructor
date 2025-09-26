// // test.service.ts
// import { Injectable } from '@nestjs/common';
// import { HttpService } from '@nestjs/axios';
// import { AxiosResponse } from 'axios';
// import { Stream } from 'stream';
// import { CreateMessageInput } from '../common/model/DTO/message/createMessage2.model';
// import { Response } from '../common/model/DTO/message/messageResponse.model';

// @Injectable()
// export class TestService {
//   constructor(private readonly httpService: HttpService) {}

//   async streamChatFromFastApi(data: CreateMessageInput): Promise<Response> {
//     // Lấy từ input
//     const { message, sessionId, fileBase64, filename } = data;

//     const url = 'https://chatbot-e5xc.onrender.com/chat'; // endpoint FastAPI

//     // Prepare form-data nếu cần file, otherwise just send text field
//     const FormData = require('form-data');
//     const form = new FormData();

//     if (message) form.append('message', message);

//     if (fileBase64 && filename) {
//       const fileBuffer = Buffer.from(fileBase64, 'base64');
//       // append file, axios will handle content-type boundary via form.getHeaders()
//       form.append('file', fileBuffer, { filename });
//     }

//     // headers: don't override Content-Type; use form.getHeaders()
//     const headers: Record<string, any> = {
//       Accept: 'text/event-stream', // nếu FastAPI trả SSE
//     };
//     if (sessionId) headers.Cookie = `session_id=${sessionId}`;

//     // Gọi axios để nhận response stream
//     const response: AxiosResponse<Stream> = await this.httpService.axiosRef.post(
//       url,
//       form,
//       {
//         headers: {
//           ...headers,
//           ...form.getHeaders(),
//         },
//         responseType: 'stream',
//       },
//     );

//     const stream = response.data;

//     // Gom các chunk trả về (đơn giản) — bạn có thể parse SSE nếu cần
//     let accumulated = '';

//     await new Promise<void>((resolve, reject) => {
//       stream.on('data', (chunk: Buffer) => {
//         const str = chunk.toString('utf-8');
//         // Nếu FastAPI trả SSE, các event có thể kèm "data: ..."
//         // Bạn có thể parse theo spec SSE. Ở đây ta ghi log và gom nội dung.
//         process.stdout.write(str);
//         accumulated += str;
//       });

//       stream.on('end', () => {
//         console.log('Stream ended');
//         resolve();
//       });

//       stream.on('error', (err) => {
//         console.error('Stream error', err);
//         reject(err);
//       });
//     });

//     // Trả về Response model (tùy chỉnh)
//     return {
//       type: 'success',
//       message: 'Stream finished',
//       response: accumulated,
//       agent: 'fastapi',
//     };
//   }
// }
