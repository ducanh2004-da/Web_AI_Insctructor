import { Field, ObjectType } from '@nestjs/graphql';
import { IsDate, IsString, IsUUID, IsEnum } from 'class-validator';
import { SenderType } from '@prisma/client';

@ObjectType()
export class MessageResponse {
  @Field(() => String)
  @IsUUID()
  id: string;

  @Field(() => String)
  @IsString()
  content: string;

  @Field(() => String)
  @IsEnum(SenderType)
  senderType: SenderType;

  @Field(() => String)
  @IsUUID()
  conversationId: string;

  @Field(() => Date)
  @IsDate()
  timestamp: Date;
}
