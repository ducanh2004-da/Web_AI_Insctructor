import { IsOptional, IsString, IsUUID } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateLessonDto {
  @Field(() => String)
  @IsUUID()
  id: string;

  @Field(() => String)
  @IsOptional()
  @IsString()
  lessonName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  abstract?: string;

  @Field(() => String)
  @IsOptional()
  @IsString()
  courseId?: string;
}
