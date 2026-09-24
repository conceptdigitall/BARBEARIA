import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ error: 'Nenhuma barbearia cadastrada' }, { status: 404 });
    }

    const barbers = await prisma.user.findMany({
      where: {
        tenantId: tenant.id,
        isActive: true,
        role: { in: ['OWNER', 'BARBER'] },
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
      orderBy: {
        role: 'asc', // OWNER first, then BARBERS
      },
    });

    return NextResponse.json({ success: true, barbers });
  } catch (error) {
    console.error('Error fetching barbers:', error);
    return NextResponse.json({ error: 'Erro interno ao carregar barbeiros' }, { status: 500 });
  }
}
