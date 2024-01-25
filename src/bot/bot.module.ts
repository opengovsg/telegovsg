import { Module } from '@nestjs/common'
import { BotUpdate } from './bot.update'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [ConfigModule],
  providers: [BotUpdate],
})
export class BotModule {}
