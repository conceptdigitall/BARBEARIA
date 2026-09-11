import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date'); // YYYY-MM-DD

  try {
    let dateFilter = {};
    if (dateStr) {
      const startOfDay = new Date(dateStr + 'T00:00:00');
      const endOfDay = new Date(dateStr + 'T23:59:59.999');
      dateFilter = {
        dateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };
    }

    const rawAppointments = await prisma.appointment.findMany({
      where: {
        ...dateFilter,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        barber: {
          select: {
            name: true,
          },
        },
        service: {
          select: {
            name: true,
            price: true,
          },
        },
      },
      orderBy: {
        dateTime: 'asc',
      },
    });

    const appointments = rawAppointments.map((app) => ({
      id: app.id,
      dateTime: app.dateTime.toISOString(),
      status: app.status,
      whatsappSentAt: app.whatsappSentAt ? app.whatsappSentAt.toISOString() : null,
      client: {
        id: app.client.id,
        name: app.client.name,
        phone: app.client.phone,
      },
      barber: {
        name: app.barber.name,
      },
      service: {
        name: app.service.name,
        price: Number(app.service.price),
      },
      additionalServices: app.additionalServices ? (app.additionalServices as any) : null,
    }));

    return NextResponse.json({ success: true, appointments });
  } catch (error) {
    console.error('Error fetching admin appointments:', error);
    return NextResponse.json({ error: 'Erro ao buscar agendamentos' }, { status: 500 });
  }
}
