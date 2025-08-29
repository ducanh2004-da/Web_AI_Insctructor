import { Module } from '@nestjs/common';
import { ConversationService } from '@/common/providers/conversation.service';
import { ConversationDAO } from '@/common/DAO/conversation.dao';
import { PrismaModule } from '@/prisma/prisma.module';
import { ConversationResolver } from '@/common/resolvers/conversation.resolver';
import { AuthModule } from './auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ConversationService, ConversationDAO, ConversationResolver],
  exports: [ConversationService],
})
export class ConversationModule {}
