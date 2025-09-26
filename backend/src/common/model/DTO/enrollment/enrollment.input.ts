import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, MinLength, IsInt, Min } from 'class-validator';

@InputType()
export class CreateEnrollmentInput {
  @Field()
  @IsString()
  userId: string;

  @Field()
  @IsString()
  courseId: string;

  @Field()
  @IsInt()
  @Min(0)
  totalLessons: number;
}