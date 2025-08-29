import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthResponse {
  @Field(() => Boolean)  // Đây là field không thể null
  success: boolean;

  @Field(() => String, { nullable: true })  // Cho phép null
  message?: string;

  @Field(() => String, { nullable: true }) // ✅ Fix lỗi: Chỉ rõ kiểu dữ liệu của token
  token?: string;
}

