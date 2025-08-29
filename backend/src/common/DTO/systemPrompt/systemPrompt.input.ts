import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

// Bỏ aiId trong các Input
@InputType()
export class CreateSystemPromptInput {
  @Field()
  @IsString()
  @MinLength(3)
  title: string;

  @Field()
  @IsString()
  @MinLength(10)
  content: string;
}

@InputType()
export class UpdateSystemPromptInput {
  @Field({ nullable: true })
  @IsString()
  @MinLength(3)
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsString()
  @MinLength(10)
  @IsOptional()
  content?: string;
}
