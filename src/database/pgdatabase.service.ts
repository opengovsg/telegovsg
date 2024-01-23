import Pool from 'pg-pool';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Postgres } from '@telegraf/session/pg';
import { NoticeLoggingClient } from './client/NoticeLoggingClient';
import { DatabaseService } from './database.service';

const NEON_SESSION_URL = 'pg.neon.tech';

@Injectable()
export class PgDatabaseService extends DatabaseService {
  constructor(private configService: ConfigService) {
    super();

    const isNeonPasswordless =
      this.configService.get<string>('database.url') === NEON_SESSION_URL;

    // Prompt Neon session connection on console
    if (isNeonPasswordless) {
      const pool = new Pool(
        { host: NEON_SESSION_URL, ssl: true },
        NoticeLoggingClient,
      );
      this.store = Postgres({ pool });
      return;
    }

    this.store = Postgres({
      host: this.configService.get<string>('database.host'),
      user: this.configService.get<string>('database.user'),
      password: this.configService.get<string>('database.password'),
      database: this.configService.get<string>('database.name'),
      port: this.configService.get<number>('database.port'),
      config: {
        ssl:
          this.configService.get<boolean>('database.ssl') ||
          process.env.NODE_ENV === 'production' ||
          isNeonPasswordless,
      },
    });
  }
}
