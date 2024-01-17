import { ConfigService } from '@nestjs/config';
import { Ctx, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';

@Update()
export class BotUpdate {
  constructor(private configService: ConfigService) {}
  @Start()
  async onStart(@Ctx() ctx: Context) {
    const chatId = (await ctx.getChat()).id;
    const url = `${this.configService.get(
      'bot.domain',
    )}/auth/sgid/auth-url?chatId=${chatId}`;
    await ctx.reply('Please authenticate yourself', {
      reply_markup: {
        inline_keyboard: [[{ text: 'Authenticate with Singpass', url }]],
      },
    });
  }
}
