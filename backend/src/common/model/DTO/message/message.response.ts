import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsDate, IsString, IsUUID, IsEnum } from 'class-validator';
import { SenderType } from '@prisma/client';

registerEnumType(SenderType, {
  name: 'SenderType',
  description: 'Sender type from Prisma enum',
});

@ObjectType()
export class MessageResponse {
  @Field(() => String, { nullable: true })
  @IsUUID()
  id?: string  = '1';

  @Field(() => String, { nullable: true })
  @IsString()
  content?: string  = 'hi';

  @Field(() => SenderType, { nullable: true })
  @IsEnum(SenderType)
  senderType?: SenderType;

  @Field(() => String, { nullable: true })
  @IsUUID()
  conversationId?: string  = '1';

  @Field(() => Date, { nullable: true })
  @IsDate()
  timestamp?: Date;

  @Field(() => String, { nullable: true })
  type?: string;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => String, { nullable: true })
  agent?: string;

  @Field(() => String, { nullable: true })
  response?: string;
}
