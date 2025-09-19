import { Module } from '@nestjs/common';
import { CourseModule } from './course/course.module';
import { LessonModule } from './lesson/lesson.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { LessonExplanationModule } from './lesson-explaination/lesson-explanation.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { ProgressModule } from './progress/progress.module';
import { SystemPromptModule } from './system-prompt/system-prompt.module';
import { ConversationModule } from './conversation/conversation.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver, // Thêm driver vào đây
      autoSchemaFile: 'schema.gql',
      debug: true, // Bật debug mode
      introspection: true,
      playground: true,
      csrfPrevention: false, // Tắt CSRF protection
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },
    }),
    CourseModule,
    LessonModule,
    UserModule,
    AuthModule,
    LessonExplanationModule,
    EnrollmentModule,
    ProgressModule,
    SystemPromptModule,
    ConversationModule,
    MessageModule,
  ],
})
export class AppModule {}
