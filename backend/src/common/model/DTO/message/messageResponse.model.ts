// response.model.ts
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Response {
  @Field(() => String, { nullable: true })
  type?: string;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => String, { nullable: true })
  agent?: string;

  @Field(() => String, { nullable: true })
  response?: string;
}
