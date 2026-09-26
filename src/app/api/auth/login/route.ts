import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { getJwtSecret } from '@/lib/jwt-secret';
import { hashPassword, isLegacyHash, verifyPassword } from '@/lib/password';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    let user: {
      id: string;
      email: string;
      role: string;
      name: string;
      passwordHash: string;
    } | null = null;

    try {
      user = await prisma.user.findFirst({
        where: {
          email: {
            equals: cleanEmail,
          },
        },
      });
    } catch (dbError) {
      console.error('Database connection error in /api/auth/login:', dbError);
      return NextResponse.json(
        { error: 'Não foi possível conectar ao banco de dados no momento. Tente novamente em instantes.' },
        { status: 503 }
      );
    }

    if (!user) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    if (!verifyPassword(cleanPassword, user.passwordHash)) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    // Converte hash antigo (SHA-256 sem salt) para scrypt, sem o usuário perceber.
    if (isLegacyHash(user.passwordHash)) {
      await prisma.user
        .update({ where: { id: user.id }, data: { passwordHash: hashPassword(cleanPassword) } })
        .catch((e: unknown) => console.error('Falha ao atualizar hash de senha:', e));
    }

    // Generate JWT Token
    const secret = getJwtSecret();
    if (!secret) {
      return NextResponse.json({ error: 'Login indisponível: servidor sem configuração de segurança.' }, { status: 503 });
    }

    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    // Create JSON response and attach HttpOnly cookie
    const response = NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    });

    return response;
  } catch (error: any) {
    console.error('Unhandled error in POST /api/auth/login:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
