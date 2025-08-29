import { Field, ObjectType } from '@nestjs/graphql';
import { IsString, IsUUID, IsOptional, IsDate } from 'class-validator';

@ObjectType()
export class LessonDto {
  @Field(() => String)
  @IsUUID()
  id: string;

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

  @Field(() => Date)
  @IsDate()
  createdAt: Date;

  @Field(() => Date)
  @IsDate()
  updatedAt: Date;
}
