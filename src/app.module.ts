import { Module } from '@nestjs/common';

import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        token: process.env.BOT_TOKEN,
        launchOptions: {
          webhook: {
            domain: process.env.BOT_DOMAIN,
            hookPath: process.env.BOT_PATH,
          },
        },
        include: [BotModule],
      }),
    }),
    AuthModule,
    BotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
