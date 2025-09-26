import { IsString, IsOptional, IsUUID } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateLessonDto {
  @Field(() => String)
  @IsString()
  lessonName: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  abstract?: string | null;

  @Field(() => String)
  @IsUUID()
  courseId: string;
}
