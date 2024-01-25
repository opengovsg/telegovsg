import { Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { TelegrafExceptionFilter } from './telegraf-exception-filter'

@Module({
  providers: [{ provide: APP_FILTER, useClass: TelegrafExceptionFilter }],
})
export class TelegrafFiltersModule {}
