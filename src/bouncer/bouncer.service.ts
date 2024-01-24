import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { DatabaseService } from 'src/database/database.service';
import { Telegraf } from 'telegraf';
import { Chat, User } from 'telegraf/typings/core/types/typegram';

@Injectable()
export class BouncerService {
  constructor(
    @InjectBot() private bot: Telegraf,
    private readonly databaseService: DatabaseService,
  ) {}

  async handleNewChatMember(chat: Chat, user: User, userChatId: number) {
    const { id: chatId } = chat;
    const { id: userId, first_name } = user;
    const possibleUser = await this.databaseService.store.get(
      userId.toString(),
    );
    if (possibleUser.poDetails && possibleUser.poDetails.length !== 0) {
      // User is a public officer
      await this.bot.telegram.approveChatJoinRequest(chatId, userId);
      console.log(
        `Allowing user ${first_name} with id: ${userId} to join chat ${chatId}`,
      );
    } else {
      await this.bot.telegram.declineChatJoinRequest(chatId, userId);
      console.log(
        `User ${first_name} with id: ${userId} attempted to join chat ${chatId} without authorization: rejecting request`,
      );
      await this.bot.telegram.sendMessage(
        chatId,
        `User [${first_name}](tg://user?id=${userId}) attempted to join chat without authorization: rejecting request`,
        {
          parse_mode: 'Markdown',
        },
      );
      await this.bot.telegram.sendMessage(
        userChatId,
        'Please verify your identity and join the group via the link provided! Use "/start" to begin',
      );
    }
  }
}
