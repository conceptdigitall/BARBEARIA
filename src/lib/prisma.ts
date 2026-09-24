import { PrismaClient } from '@prisma/client';

const FALLBACK_DATABASE_URL =
  'mysql://urxeqfgitchopiau:HovIXB7MJWsJei7XaB68@bzp6k1mpnkmh2iffbmvh-mysql.services.clever-cloud.com:3306/bzp6k1mpnkmh2iffbmvh?connection_limit=1&pool_timeout=10&connect_timeout=10';

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

/**
 * Reaps any idle/sleeping connections from our user to keep the pool under Clever Cloud's limit (5 max)
 */
export async function reapIdleConnections(): Promise<number> {
  try {
    const list: any[] = await prisma.$queryRawUnsafe('SHOW PROCESSLIST');
    let reapedCount = 0;
    for (const proc of list) {
      const id = proc.Id ?? proc.f0;
      const command = proc.Command ?? proc.f4;
      const time = Number(proc.Time ?? proc.f5 ?? 0);
      if (command === 'Sleep' && time >= 2 && id) {
        try {
          await prisma.$queryRawUnsafe(`KILL ${id}`);
          reapedCount++;
        } catch {
          // ignore if process already terminated
        }
      }
    }
    return reapedCount;
  } catch {
    return 0;
  }
}

/**
 * Executes a Prisma database operation with automatic retry and connection backoff
 * whenever Clever Cloud hits the ERROR 42000 (1226): max_user_connections (limit 5)
 */
export async function withPrismaRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 600
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (error: any) {
      attempt++;
      const errorMessage = String(error?.message || error || '');
      const isConnectionLimit =
        errorMessage.includes('1226') ||
        errorMessage.includes('max_user_connections') ||
        errorMessage.includes('connection limit') ||
        errorMessage.includes('Timed out fetching a new connection');

      if (isConnectionLimit && attempt < maxRetries) {
        console.warn(`[Prisma Pool] Hit Clever Cloud connection limit (attempt ${attempt}/${maxRetries}). Backing off ${delayMs * attempt}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
        await reapIdleConnections().catch(() => {});
        continue;
      }
      throw error;
    }
  }
}
