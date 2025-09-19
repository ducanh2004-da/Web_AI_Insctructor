import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationDAO } from '@/conversation/conversation.dao';
import { PrismaModule } from '@/prisma/prisma.module';
import { ConversationResolver } from '@/conversation/conversation.resolver';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ConversationService, ConversationDAO, ConversationResolver],
  exports: [ConversationService],
})
export class ConversationModule {}
