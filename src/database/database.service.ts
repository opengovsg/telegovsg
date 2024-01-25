import { Injectable } from '@nestjs/common'
import { SessionStore } from '@telegraf/session/types'
import { Kysely } from 'kysely'
import { BouncerDatabase } from './types'

@Injectable()
export class DatabaseService {
  store: SessionStore<any>
  bouncerStore: Kysely<BouncerDatabase>
}
