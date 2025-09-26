import { apiConfig } from '@/configs'
import { Message } from '../types'

export const messageService = {
  createMessage: async (
    conversationId: string | null, 
    message: string | null, 
    sessionId: string | null,
    fileBase64: string | null,
    filename: string | null,
    courseId: string | null, 
    lessonId: string | null
  ): Promise<Message> => {
    const response = await apiConfig.post('', {
      query: `
        mutation CreateMessage($data: CreateMessage2Input!) {
        createMessage(data: $data) {
          agent
          content
          conversationId
          id
          message
          response
          senderType
          timestamp
          type
        }
      }
      `,
      variables: {
        data: {
          conversationId,
          message,
          sessionId,
          fileBase64,
          filename
        }
      }
    })
    console.log(response.data.data.createMessage)
    return response.data.data.createMessage
  }
}