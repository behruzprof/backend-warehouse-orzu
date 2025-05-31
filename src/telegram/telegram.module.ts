// telegram.module.ts
import { Module, Global } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Global()
@Module({
  providers: [TelegramService],
  exports: [TelegramService], 
})
export class TelegramModule {}