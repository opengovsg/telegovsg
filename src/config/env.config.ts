import { registerAs } from '@nestjs/config';
import { parse } from 'pg-connection-string';

export const sgidEnvConfig = registerAs('sgid', () => ({
  client_id: process.env.SGID_CLIENT_ID,
  client_secret: process.env.SGID_CLIENT_SECRET,
  private_key: process.env.SGID_PRIVATE_KEY,
}));

export const botEnvConfig = registerAs('bot', () => ({
  token: process.env.BOT_TOKEN,
  path: process.env.BOT_PATH || '/webhook',
  domain: process.env.BOT_DOMAIN || `https://${process.env.VERCEL_BRANCH_URL}`,
}));

export const databaseEnvConfig = registerAs('database', () => {
  const parsedUrl = parse(process.env.DATABASE_URL);
  return {
    url: process.env.DATABASE_URL,
    host: parsedUrl.host || process.env.DATABASE_HOST,
    user: parsedUrl.user || process.env.DATABASE_USER,
    password: parsedUrl.password || process.env.PASSWORD,
    name: parsedUrl.database || process.env.DATABASE_NAME,
    port: parseInt(parsedUrl.port || '5432'),
    ssl: parsedUrl.ssl,
  };
});
