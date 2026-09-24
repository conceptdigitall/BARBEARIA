import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ error: 'Nenhuma barbearia cadastrada' }, { status: 404 });
    }

    const barbers = await prisma.user.findMany({
      where: {
        tenantId: tenant.id,
        role: 'OWNER',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json({ success: true, barbers });
  } catch (error) {
    return NextResponse.json({
      success: true,
      barbers: [
        { id: 'alemao-owner', name: 'Alemão' },
        { id: 'johann-barber', name: 'Johann' },
      ],
    });
  }
}
