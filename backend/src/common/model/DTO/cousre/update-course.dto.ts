import { InputType } from '@nestjs/graphql';
import { Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID } from 'class-validator';
@InputType()
export class UpdateCourseDto {
  @Field(() => String)
  @IsUUID()
  id: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  courseName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  abstract?: string;
}
