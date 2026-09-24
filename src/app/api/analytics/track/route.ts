import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ error: 'Nenhuma barbearia cadastrada' }, { status: 404 });
    }

    // Increment views atomically
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        views: { increment: 1 },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: true, views: 1 });
  }
}
