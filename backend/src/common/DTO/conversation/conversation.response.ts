import { Field, ObjectType } from '@nestjs/graphql';
import {
  IsDate,
  IsString,
  IsUUID,
  IsOptional,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MessageResponse } from '../message/message.response';

@ObjectType()
export class ConversationResponse {
  @Field(() => String)
  @IsUUID()
  id: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => String)
  @IsUUID()
  creatorId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageResponse)
  messages: MessageResponse[];

  @Field(() => Date)
  @IsDate()
  createdAt: Date;

  @Field(() => Date)
  @IsDate()
  updatedAt: Date;
}
