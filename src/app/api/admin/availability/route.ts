import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET: Fetch all availability records for the logged-in barber
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const availabilities = await prisma.availability.findMany({
      where: { barberId: user.id },
      orderBy: { dayOfWeek: 'asc' },
    });
    
    return NextResponse.json({ success: true, availabilities });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ error: 'Erro interno ao carregar a disponibilidade' }, { status: 500 });
  }
}

// POST: Save/Upsert availability records for the logged-in barber
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { availabilities } = body;

    if (!Array.isArray(availabilities)) {
      return NextResponse.json({ error: 'Formato de dados inválido' }, { status: 400 });
    }

    // Process each day
    for (const item of availabilities) {
      const { dayOfWeek, startTime, endTime, breakStart, breakEnd, isActive } = item;

      // Find if an availability record already exists for this day
      const existing = await prisma.availability.findFirst({
        where: {
          barberId: user.id,
          dayOfWeek,
        },
      });

      if (existing) {
        // Update the existing record
        await prisma.availability.update({
          where: { id: existing.id },
          data: {
            startTime,
            endTime,
            breakStart: breakStart || null,
            breakEnd: breakEnd || null,
            isActive: !!isActive,
          },
        });
      } else {
        // Create a new record
        await prisma.availability.create({
          data: {
            barberId: user.id,
            dayOfWeek,
            startTime,
            endTime,
            breakStart: breakStart || null,
            breakEnd: breakEnd || null,
            isActive: !!isActive,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar a disponibilidade' }, { status: 500 });
  }
}
