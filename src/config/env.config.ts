import { registerAs } from '@nestjs/config'
import { parse } from 'pg-connection-string'

export const sgidEnvConfig = registerAs('sgid', () => ({
  client_id: process.env.SGID_CLIENT_ID,
  client_secret: process.env.SGID_CLIENT_SECRET,
  private_key: process.env.SGID_PRIVATE_KEY,
}))

export const botEnvConfig = registerAs('bot', () => ({
  token: process.env.BOT_TOKEN,
  path: process.env.BOT_PATH || '/webhook',
  domain: process.env.BOT_DOMAIN || `https://${process.env.VERCEL_BRANCH_URL}`,
}))

export const databaseEnvConfig = registerAs('database', () => {
  const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (databaseUrl) {
    const parsedUrl = parse(databaseUrl)
    return {
      url: databaseUrl,
      host: parsedUrl.host,
      user: parsedUrl.user,
      password: parsedUrl.password,
      name: parsedUrl.database,
      port: parseInt(parsedUrl.port || '5432'),
      ssl: parsedUrl.ssl,
    }
  } else {
    return {
      url: databaseUrl,
      host: process.env.POSTGRES_HOST || process.env.DATABASE_HOST,
      user: process.env.POSTGRES_USER || process.env.DATABASE_USER,
      password: process.env.POSTGRES_PASSWORD || process.env.DATABASE_PASSWORD,
      name: process.env.POSTGRES_DATABASE || process.env.DATABASE_NAME,
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      ssl: process.env.DATABASE_SSL_ENABLED,
    }
  }
})
