import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProgressResponse {
  @Field()
  id: string;
  
  @Field()
  userId: string;
  
  @Field()
  courseId: string;
  
  @Field()
  completedLessons: number;
  
  @Field()
  totalLessons: number;
  
  @Field()
  percentage: number;
  
  @Field()
  updatedAt: Date;
}
