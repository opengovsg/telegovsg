import { registerAs } from '@nestjs/config';

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
