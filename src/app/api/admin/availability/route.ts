import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET: Fetch all availability records for a barber (or logged-in/owner barber)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedBarberId = searchParams.get('barberId');

    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ error: 'Nenhuma barbearia cadastrada' }, { status: 404 });
    }

    // Get all active barbers in the tenant
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
        role: 'asc', // OWNER first
      },
    });

    const sessionUser = await getSessionUser();

    // Determine target barber ID
    let targetBarberId = requestedBarberId;
    if (!targetBarberId) {
      targetBarberId = sessionUser?.id || barbers.find((b) => b.role === 'OWNER')?.id || barbers[0]?.id;
    }

    if (!targetBarberId) {
      return NextResponse.json({ error: 'Nenhum barbeiro encontrado' }, { status: 404 });
    }

    let availabilities = await prisma.availability.findMany({
      where: { barberId: targetBarberId },
      orderBy: { dayOfWeek: 'asc' },
    });

    // If no availability records exist yet for this barber, seed default 6 working days (Seg a Sáb)
    if (availabilities.length === 0) {
      const defaultDays = [
        { dayOfWeek: 1, startTime: '09:00', endTime: '19:00', breakStart: '12:00', breakEnd: '13:00', isActive: true },
        { dayOfWeek: 2, startTime: '09:00', endTime: '19:00', breakStart: '12:00', breakEnd: '13:00', isActive: true },
        { dayOfWeek: 3, startTime: '09:00', endTime: '19:00', breakStart: '12:00', breakEnd: '13:00', isActive: true },
        { dayOfWeek: 4, startTime: '09:00', endTime: '19:00', breakStart: '12:00', breakEnd: '13:00', isActive: true },
        { dayOfWeek: 5, startTime: '09:00', endTime: '19:00', breakStart: '12:00', breakEnd: '13:00', isActive: true },
        { dayOfWeek: 6, startTime: '09:00', endTime: '19:00', breakStart: '12:00', breakEnd: '13:00', isActive: true },
        { dayOfWeek: 0, startTime: '09:00', endTime: '14:00', breakStart: null, breakEnd: null, isActive: false },
      ];

      for (const d of defaultDays) {
        await prisma.availability.create({
          data: {
            barberId: targetBarberId,
            dayOfWeek: d.dayOfWeek,
            startTime: d.startTime,
            endTime: d.endTime,
            breakStart: d.breakStart,
            breakEnd: d.breakEnd,
            isActive: d.isActive,
          },
        });
      }

      availabilities = await prisma.availability.findMany({
        where: { barberId: targetBarberId },
        orderBy: { dayOfWeek: 'asc' },
      });
    }

    return NextResponse.json({
      success: true,
      selectedBarberId: targetBarberId,
      barbers,
      availabilities,
    });
  } catch (error: any) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      {
        error: 'Erro interno ao carregar a disponibilidade',
        details: error?.message || String(error),
        code: error?.code,
      },
      { status: 500 }
    );
  }
}

// POST: Save/Upsert availability records for a barber
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { barberId, availabilities } = body;

    if (!Array.isArray(availabilities)) {
      return NextResponse.json({ error: 'Formato de dados inválido' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ error: 'Nenhuma barbearia cadastrada' }, { status: 404 });
    }

    const sessionUser = await getSessionUser();
    let targetBarberId = barberId;
    if (!targetBarberId) {
      targetBarberId = sessionUser?.id;
    }
    if (!targetBarberId) {
      const owner = await prisma.user.findFirst({
        where: { tenantId: tenant.id, role: 'OWNER', isActive: true },
      });
      targetBarberId = owner?.id;
    }

    if (!targetBarberId) {
      return NextResponse.json({ error: 'Barbeiro não especificado' }, { status: 400 });
    }

    // Process each day
    for (const item of availabilities) {
      const { dayOfWeek, startTime, endTime, breakStart, breakEnd, isActive } = item;

      const existing = await prisma.availability.findFirst({
        where: {
          barberId: targetBarberId,
          dayOfWeek: Number(dayOfWeek),
        },
      });

      if (existing) {
        await prisma.availability.update({
          where: { id: existing.id },
          data: {
            startTime: startTime || '09:00',
            endTime: endTime || '19:00',
            breakStart: breakStart || null,
            breakEnd: breakEnd || null,
            isActive: Boolean(isActive),
          },
        });
      } else {
        await prisma.availability.create({
          data: {
            barberId: targetBarberId,
            dayOfWeek: Number(dayOfWeek),
            startTime: startTime || '09:00',
            endTime: endTime || '19:00',
            breakStart: breakStart || null,
            breakEnd: breakEnd || null,
            isActive: Boolean(isActive),
          },
        });
      }
    }

    const updatedAvailabilities = await prisma.availability.findMany({
      where: { barberId: targetBarberId },
      orderBy: { dayOfWeek: 'asc' },
    });

    return NextResponse.json({ success: true, availabilities: updatedAvailabilities });
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar a disponibilidade' }, { status: 500 });
  }
}
