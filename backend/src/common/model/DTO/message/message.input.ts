import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateMessageInput {
  @Field(() => String)
  @IsString()
  content: string;

  @Field(() => String)
  @IsUUID()
  conversationId: string;

  @Field(() => String)
  courseId: string;

  @Field(() => String)
  lessonId: string;
}

@InputType()
export class UpdateMessageInput {
  @Field(() => String)
  @IsUUID()
  id: string;

  @Field(() => String)
  @IsString()
  content: string;
}

@InputType()
export class CreateMessage2Input {
  @Field(() => String, { nullable: true })
  @IsString()
  message: string;

  @Field(() => String, { nullable: true })
  sessionId?: string;

  // Không dùng Buffer ở GraphQL input — dùng base64 string (hoặc Upload scalar nếu muốn upload file)
  @Field(() => String, { nullable: true })
  fileBase64?: string;

  @Field(() => String, { nullable: true })
  filename?: string;

  @Field(() => String)
  @IsUUID()
  conversationId: string;
}
