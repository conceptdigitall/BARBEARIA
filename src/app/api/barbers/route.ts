import { prisma, withPrismaRetry } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tenant = await withPrismaRetry(() => prisma.tenant.findFirst());
    if (!tenant) {
      return NextResponse.json({ error: 'Nenhuma barbearia cadastrada' }, { status: 404 });
    }

    const barbers = await withPrismaRetry(() =>
      prisma.user.findMany({
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
      })
    );

    return NextResponse.json({ success: true, barbers });
  } catch (error: any) {
    console.warn('Prisma barbers warning (returning default barbers):', error?.message);
    return NextResponse.json({
      success: true,
      barbers: [
        { id: 'ce544982-f443-43fe-a794-353c3bd5e040', name: 'Alemão', role: 'OWNER' },
      ],
      isDegraded: true,
    });
  }
}
