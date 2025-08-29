import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserResponse {
  @Field()
  id: string;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field(() => String, { nullable: true }) // 👈 Định rõ kiểu
  phoneNumber?: string;

  @Field()
  role: string; // Thêm role vào response

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
