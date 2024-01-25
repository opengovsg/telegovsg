import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import {
  TelegrafExecutionContext,
  InjectBot,
  TelegrafException,
} from 'nestjs-telegraf'
import { Context, Telegraf } from 'telegraf'
import { ConfigService } from '@nestjs/config'
import { DatabaseService } from '../../database/database.service'
import { UserContext } from '../user-context'

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = TelegrafExecutionContext.create(context)
    const { from, chat, session, update } = ctx.getContext<UserContext>()
    const userId = from.id
    if (session?.verified_date) return true
    const url = `${this.configService.get(
      'bot.domain',
    )}/auth/sgid/auth-url?userId=${userId}`
    await this.bot.telegram.sendMessage(
      chat.id,
      'You need to be authenticated to use this command.',
      {
        reply_markup: {
          inline_keyboard: [[{ text: 'Authenticate with Singpass', url }]],
        },
      },
    )
    throw new TelegrafException(
      `User ${from.username} (id:${from.id}) was not logged in when accessing '${update['message']['text']}' which requires authorization`,
    )
  }
}
