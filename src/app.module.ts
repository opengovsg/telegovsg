import { Module } from '@nestjs/common'

import { TelegrafModule } from 'nestjs-telegraf'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { BotModule } from './bot/bot.module'
import {
  botEnvConfig,
  databaseEnvConfig,
  sgidEnvConfig,
} from './config/env.config'
import { DatabaseModule } from './database/database.module'
import { TelegrafFiltersModule } from './filters/telegraf-filters.module'
import { BouncerModule } from './bouncer/bouncer.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [sgidEnvConfig, botEnvConfig, databaseEnvConfig],
    }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('bot.token'),
        launchOptions: {
          webhook: {
            domain: configService.get<string>('bot.domain'),
            hookPath: configService.get<string>('bot.path'),
          },
        },
        include: [BotModule],
      }),
    }),
    DatabaseModule,
    TelegrafFiltersModule,
    AuthModule,
    BotModule,
    BouncerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
