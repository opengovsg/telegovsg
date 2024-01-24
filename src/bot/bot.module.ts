import { Module } from '@nestjs/common'
import { BotUpdate } from './bot.update'
import { ConfigModule } from '@nestjs/config'
import { BouncerModule } from 'src/bouncer/bouncer.module'

@Module({
  imports: [ConfigModule, BouncerModule],
  providers: [BotUpdate],
})
export class BotModule {}
