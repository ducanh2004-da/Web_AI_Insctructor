import { Field, ObjectType } from '@nestjs/graphql';

// Bỏ aiId khỏi response nếu không cần hiển thị
@ObjectType()
export class SystemPromptResponse {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field()
  createdAt: Date;
}
