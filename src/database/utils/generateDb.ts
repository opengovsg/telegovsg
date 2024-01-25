import Pool from 'pg-pool';
import { Kysely, PostgresDialect } from 'kysely';
import { config } from 'dotenv';
import { parse } from 'pg-connection-string';
import { NoticeLoggingClient } from '../client/NoticeLoggingClient';

config();

interface DatabaseConfig {
  url: string;
  host: string;
  user: string;
  password: string;
  name: string;
  port: number;
  ssl: string | boolean;
}

const NEON_SESSION_URL = 'pg.neon.tech';
export const generateDb = async () => {
  const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  let databaseConfig = {
    url: databaseUrl,
    host: process.env.POSTGRES_HOST || process.env.DATABASE_HOST,
    user: process.env.POSTGRES_USER || process.env.DATABASE_USER,
    password: process.env.POSTGRES_PASSWORD || process.env.DATABASE_PASSWORD,
    name: process.env.POSTGRES_DATABASE || process.env.DATABASE_NAME,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    ssl: process.env.DATABASE_SSL_ENABLED,
  } as DatabaseConfig;
  if (databaseUrl) {
    const parsedUrl = parse(databaseUrl);
    databaseConfig = {
      url: databaseUrl,
      host: parsedUrl.host,
      user: parsedUrl.user,
      password: parsedUrl.password,
      name: parsedUrl.database,
      port: parseInt(parsedUrl.port || '5432'),
      ssl: parsedUrl.ssl,
    };
  }
  const isNeonPasswordless = databaseConfig.host === NEON_SESSION_URL;

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
        host: databaseConfig.host,
        user: databaseConfig.user,
        password: databaseConfig.password,
        database: databaseConfig.name,
        port: databaseConfig.port,

        ssl:
          process.env.NODE_ENV === 'production' || Boolean(databaseConfig.ssl),
      });
  return new Kysely({
    dialect: new PostgresDialect({
      pool,
    }),
  });
};
