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
