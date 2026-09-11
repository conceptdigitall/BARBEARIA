import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ error: 'Nenhum tenant cadastrado' }, { status: 404 });
    }

    const clients = await prisma.client.findMany({
      where: { tenantId: tenant.id },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
      },
    });

    return NextResponse.json({ success: true, clients });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Erro interno ao carregar os clientes' }, { status: 500 });
  }
}
