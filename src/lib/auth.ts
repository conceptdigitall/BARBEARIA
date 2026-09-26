import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getJwtSecret } from './jwt-secret';

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;

    const secret = getJwtSecret();
    if (!secret) return null;

    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionUser;
  } catch (err) {
    console.error('Error verifying session token:', err);
    return null;
  }
}
