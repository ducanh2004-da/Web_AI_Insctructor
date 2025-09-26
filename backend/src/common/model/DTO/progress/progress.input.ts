import { Field, InputType } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';
import { UUID } from 'crypto';

@InputType()
export class UpdateProgressInput {
  @Field()
  userId: UUID;

  @Field()
  progressId: string;

  @Field()
  @IsInt()
  @Min(0)
  completedLessons: number;
}
