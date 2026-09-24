import { prisma, withPrismaRetry } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date'); // YYYY-MM-DD

  try {
    const tenant = await withPrismaRetry(() => prisma.tenant.findFirst());
    if (!tenant) {
      return NextResponse.json({ error: 'Nenhuma barbearia cadastrada' }, { status: 404 });
    }

    let dateFilter = {};
    if (dateStr) {
      const startOfDay = new Date(`${dateStr}T00:00:00-03:00`);
      const endOfDay = new Date(`${dateStr}T23:59:59.999-03:00`);
      dateFilter = {
        dateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };
    }

    const rawAppointments = await withPrismaRetry(() =>
      prisma.appointment.findMany({
        where: {
          tenantId: tenant.id,
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
      })
    );

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
  } catch (error: any) {
    console.warn('Prisma appointments warning (returning graceful empty):', error?.message);
    // Graceful fallback to prevent frontend 500 when Clever Cloud connection limit is saturated
    return NextResponse.json({
      success: true,
      appointments: [],
      isDegraded: true,
    });
  }
}
