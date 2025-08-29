import { Module } from '@nestjs/common';
import { MessageService } from '../common/providers/message.service';
import { MessageDAO } from '../common/DAO/message.dao';
import { MessageResolver } from '../common/resolvers/message.resolver';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthModule } from './auth.module';
import { HttpModule } from '@nestjs/axios';
import { PubSub } from 'graphql-subscriptions';
import { ConversationService } from '../common/providers/conversation.service';
import { ConversationDAO } from '../common/DAO/conversation.dao';

@Module({
  imports: [PrismaModule, AuthModule, HttpModule],
  providers: [
    MessageService,
    MessageDAO,
    MessageResolver,
    ConversationService,
    ConversationDAO,
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
  ],
  exports: [MessageService],
})
export class MessageModule {}
