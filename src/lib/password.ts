import crypto from 'crypto';

/**
 * Senhas são guardadas com scrypt + salt aleatório:  scrypt$<salt hex>$<hash hex>
 * Hashes antigos (SHA-256 puro, sem salt) ainda são aceitos no login e
 * convertidos automaticamente para scrypt na primeira entrada.
 */
const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, KEYLEN).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function isLegacyHash(stored: string): boolean {
  return !stored.startsWith('scrypt$');
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!stored) return false;

  if (stored.startsWith('scrypt$')) {
    const [, salt, hash] = stored.split('$');
    if (!salt || !hash) return false;
    const expected = Buffer.from(hash, 'hex');
    const actual = crypto.scryptSync(password, salt, expected.length);
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  }

  // Formato antigo: SHA-256 hex sem salt
  const legacy = Buffer.from(crypto.createHash('sha256').update(password).digest('hex'));
  const storedBuf = Buffer.from(stored);
  return legacy.length === storedBuf.length && crypto.timingSafeEqual(legacy, storedBuf);
}
