import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { getBotToken } from 'nestjs-telegraf'
import cookieParser from 'cookie-parser'

import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { DatabaseService } from './database/database.service'
import { session } from 'telegraf'
import { IncomingMessage, ServerResponse } from 'http'

export async function init() {
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
  return app
}

export const appPromise = init().then(async (app) => {
  await app.init()
  return app
})

export const vercelHandler = async (
  req: IncomingMessage,
  res: ServerResponse,
) => {
  const app = await appPromise
  app.getHttpAdapter().getInstance()(req, res)
}
