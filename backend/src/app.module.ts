import { Module } from '@nestjs/common';
import { CourseModule } from './modules/course.module';
import { LessonModule } from './modules/lesson.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user.module';
import { AuthModule } from './modules/auth.module';
import { LessonExplanationModule } from './modules/lesson-explanation.module';
import { EnrollmentModule } from './modules/enrollment.module';
import { ProgressModule } from './modules/progress.module';
import { SystemPromptModule } from './modules/system-prompt.module';
import { ConversationModule } from './modules/conversation.module';
import { MessageModule } from './modules/message.module';

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
