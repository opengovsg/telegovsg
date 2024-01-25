import { Injectable } from '@nestjs/common'
import { SessionStore } from '@telegraf/session/types'

@Injectable()
export class DatabaseService {
  store: SessionStore<any>
}
