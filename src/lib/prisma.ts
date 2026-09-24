import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log: ['error'],
  });

// Always store on globalThis to reuse existing connection pools in serverless environments
globalThis.prisma = prisma;
