import * as path from 'path';
import Pool from 'pg-pool';
import { promises as fs } from 'fs';
import {
  Kysely,
  Migrator,
  PostgresDialect,
  FileMigrationProvider,
} from 'kysely';
import { config } from 'dotenv';
import { parse } from 'pg-connection-string';
import { NoticeLoggingClient } from './client/NoticeLoggingClient';

const NEON_SESSION_URL = 'pg.neon.tech';

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

async function migrateToLatest() {
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

  console.log(isNeonPasswordless);
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
  const database = new Kysely({
    dialect: new PostgresDialect({
      pool,
    }),
  });

  const migrator = new Migrator({
    db: database,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, 'migrations'),
    }),
  });

  console.log(migrator);
  const { error, results } = await migrator.migrateToLatest();

  console.log(error, results);
  results?.forEach((migrationResult) => {
    if (migrationResult.status === 'Success') {
      console.log(
        `Migration "${migrationResult.migrationName}" was executed successfully`,
      );
    } else if (migrationResult.status === 'Error') {
      console.error(
        `Failed to execute migration "${migrationResult.migrationName}"`,
      );
    }
  });

  if (error) {
    console.error('Failed to migrate');
    console.error(error);
    process.exit(1);
  }

  await database.destroy();
}

migrateToLatest();
