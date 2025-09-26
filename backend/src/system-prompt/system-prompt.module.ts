import { Module } from '@nestjs/common';
import { SystemPromptService } from './system-prompt.service';
import { SystemPromptResolver } from './system-prompt.resolver';
import { SystemPromptDAO } from './systemPrompt.dao';
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule], // Import PrismaModule
  providers: [SystemPromptService, SystemPromptDAO, SystemPromptResolver],
  exports: [SystemPromptService],
})
export class SystemPromptModule {}
