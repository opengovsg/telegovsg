import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { getBotToken } from 'nestjs-telegraf'
import cookieParser from 'cookie-parser'

import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { DatabaseService } from './database/database.service'
import { session } from 'telegraf'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get<ConfigService>(ConfigService)
  const databaseService = app.get<DatabaseService>(DatabaseService)

  app.use(cookieParser())

  const bot = app.get(getBotToken())
  bot.use(
    session({
      store: databaseService.store,
      getSessionKey: (ctx) => `${ctx.from.id}`,
    }),
  )
  app.use(bot.webhookCallback(configService.get<string>('bot.path')))
  await app.listen(3000)
}
bootstrap()
