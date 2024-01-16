import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { getBotToken } from 'nestjs-telegraf';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  const bot = app.get(getBotToken());
  app.use(bot.webhookCallback(process.env.BOT_PATH));
  await app.listen(3000);
}
bootstrap();
