import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthResponseRegis {
  @Field(() => Boolean)  // Đây là field không thể null
  success: boolean;

  @Field(() => String, { nullable: true })  // Cho phép null
  message?: string;
}

