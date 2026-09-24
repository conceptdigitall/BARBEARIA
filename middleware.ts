import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get('token');
  const token = tokenCookie?.value;

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'barberconnect-super-secret-jwt-key-32-chars-long'
    );
    
    // Verify JWT token using jose (fully compatible with Edge runtime)
    await jwtVerify(token, secret);
    
    return NextResponse.next();
  } catch (err) {
    console.error('JWT validation failed in middleware:', err);
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
};
