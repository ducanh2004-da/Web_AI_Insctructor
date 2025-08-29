import { Field, ObjectType } from '@nestjs/graphql';
import { IsString, IsUUID, IsOptional, IsArray } from 'class-validator';

@ObjectType()
export class CourseDto {
  @Field(() => String)
  @IsUUID()
  id: string;

  @Field(() => String)
  @IsString()
  courseName: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  abstract?: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  keyLearnings: string[];
}
