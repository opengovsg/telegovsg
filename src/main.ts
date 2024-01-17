import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { getBotToken } from 'nestjs-telegraf';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  app.use(cookieParser());

  const bot = app.get(getBotToken());
  app.use(bot.webhookCallback(configService.get<string>('bot.path')));
  await app.listen(3000);
}
bootstrap();
