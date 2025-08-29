import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EnrollmentResponse {
  @Field()
  userId: string;

  @Field()
  courseId: string;

  @Field()
  enrolledAt: Date; // Sửa từ createdAt thành enrolledAt cho đúng schema
}
