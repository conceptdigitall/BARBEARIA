import { PrismaClient } from '@prisma/client';

const FALLBACK_DATABASE_URL =
  'mysql://urxeqfgitchopiau:HovIXB7MJWsJei7XaB68@bzp6k1mpnkmh2iffbmvh-mysql.services.clever-cloud.com:3306/bzp6k1mpnkmh2iffbmvh?connection_limit=1&pool_timeout=20';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = FALLBACK_DATABASE_URL;
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || FALLBACK_DATABASE_URL,
    log: ['error'],
  });

// Always store on globalThis to reuse existing connection pools in serverless environments
globalThis.prisma = prisma;
