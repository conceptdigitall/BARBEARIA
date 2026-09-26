import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtSecret } from './src/lib/jwt-secret';

export async function middleware(request: NextRequest) {
  const isApi = request.nextUrl.pathname.startsWith('/api/');

  const deny = () => {
    if (isApi) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  };

  const token = request.cookies.get('token')?.value;
  const secret = getJwtSecret();
  if (!token || !secret) return deny();

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (err) {
    console.error('JWT validation failed in middleware:', err);
    return deny();
  }
}

export const config = {
  // Painel + TODAS as APIs administrativas (antes só o painel era protegido).
  matcher: ['/admin/dashboard/:path*', '/api/admin/:path*'],
};
