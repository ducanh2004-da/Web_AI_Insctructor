import { InputType } from '@nestjs/graphql';
import { Field } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
@InputType()
export class CreateCourseDto {
  @Field(() => String)
  @IsString()
  courseName: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  abstract?: string | null;
}
