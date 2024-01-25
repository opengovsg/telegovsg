import Pool from 'pg-pool'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Postgres } from '@telegraf/session/pg'
import { NoticeLoggingClient } from './client/NoticeLoggingClient'
import { DatabaseService } from './database.service'
import { Client } from 'pg'

const NEON_SESSION_URL = 'pg.neon.tech'

@Injectable()
export class PgDatabaseService extends DatabaseService {
  public readonly pool: Pool<Client>

  constructor(private readonly configService: ConfigService) {
    super()

    const isNeonPasswordless =
      this.configService.get<string>('database.host') === NEON_SESSION_URL

    const pool = isNeonPasswordless
      ? new Pool(
          {
            host: NEON_SESSION_URL,
            ssl: true,
            min: 1,
            max: 1,
            idleTimeoutMillis: 0,
          },
          NoticeLoggingClient,
        ) // Prompts Neon session connection on console
      : new Pool({
          min: 1,
          host: this.configService.get<string>('database.host'),
          user: this.configService.get<string>('database.user'),
          password: this.configService.get<string>('database.password'),
          database: this.configService.get<string>('database.name'),
          port: this.configService.get<number>('database.port'),

          ssl:
            process.env.NODE_ENV === 'production' ||
            this.configService.get<boolean>('database.ssl'),
        })

    this.pool = pool
    this.store = Postgres({ pool })
  }
}
