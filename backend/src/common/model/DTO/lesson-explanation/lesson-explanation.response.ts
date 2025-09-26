import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LessonExplanationResponse {
  @Field(() => String)
  id: string;

  @Field(() => String)
  content: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
