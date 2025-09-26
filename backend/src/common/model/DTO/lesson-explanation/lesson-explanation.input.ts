import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateLessonExplanationInput {
  @Field(() => String)
  @IsString()
  emotion: string;

  @Field(() => String)
  @IsUUID()
  lessonId: string;

  @Field(() => String)
  @IsUUID()
  userId: string;

  @Field(() => String)
  @IsString()
  courseId: string;
}

@InputType()
export class UpdateLessonExplanationInput {
  @Field(() => String)
  @IsUUID()
  id: string;

  @Field(() => String)
  @IsString()
  content: string;
}
