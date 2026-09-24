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
  const now = new Date();
  const year = parseInt(searchParams.get('year') || String(now.getFullYear()), 10);
  const month = parseInt(searchParams.get('month') || String(now.getMonth() + 1), 10); // 1-12

  try {
    // Calculate start and end of target month
    const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    const daysInMonth = endOfMonth.getDate();

    const appointments = await prisma.appointment.findMany({
      where: {
        dateTime: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        client: {
          select: {
            name: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: {
        dateTime: 'desc',
      },
    });

    let realizedRevenue = 0;
    let projectedRevenue = 0;
    let completedCount = 0;
    let confirmedCount = 0;
    let canceledCount = 0;
    let pendingCount = 0;

    // Daily breakdown map: day 1 to daysInMonth
    const dailyMap: { [day: number]: { revenue: number; count: number } } = {};
    for (let d = 1; d <= daysInMonth; d++) {
      dailyMap[d] = { revenue: 0, count: 0 };
    }

    // Service breakdown map
    const serviceMap: { [name: string]: { count: number; revenue: number } } = {};

    appointments.forEach((app) => {
      const mainPrice = Number(app.service.price);
      const addPrice = app.additionalServices
        ? (app.additionalServices as any[]).reduce((sum: number, s: any) => sum + Number(s.price || 0), 0)
        : 0;
      const totalAppPrice = mainPrice + addPrice;

      const appDate = new Date(app.dateTime);
      const day = appDate.getDate();

      if (app.status === 'COMPLETED') {
        completedCount++;
        realizedRevenue += totalAppPrice;
        projectedRevenue += totalAppPrice;

        if (dailyMap[day]) {
          dailyMap[day].revenue += totalAppPrice;
          dailyMap[day].count += 1;
        }

        // Service aggregation (completed only for actual earned revenue)
        const sName = app.service.name;
        if (!serviceMap[sName]) {
          serviceMap[sName] = { count: 0, revenue: 0 };
        }
        serviceMap[sName].count += 1;
        serviceMap[sName].revenue += totalAppPrice;
      } else if (app.status === 'CONFIRMED') {
        confirmedCount++;
        projectedRevenue += totalAppPrice;
        if (dailyMap[day]) {
          dailyMap[day].count += 1;
        }
      } else if (app.status === 'CANCELED') {
        canceledCount++;
      } else if (app.status === 'PENDING_CONFIRMATION') {
        pendingCount++;
      }
    });

    const averageTicket = completedCount > 0 ? realizedRevenue / completedCount : 0;

    const dailyBreakdown = Object.entries(dailyMap).map(([day, data]) => ({
      day: Number(day),
      revenue: data.revenue,
      count: data.count,
    }));

    const serviceBreakdown = Object.entries(serviceMap)
      .map(([name, data]) => ({
        name,
        count: data.count,
        revenue: data.revenue,
        percentage: realizedRevenue > 0 ? Math.round((data.revenue / realizedRevenue) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      success: true,
      month,
      year,
      metrics: {
        totalAppointments: appointments.length,
        completedCount,
        confirmedCount,
        canceledCount,
        pendingCount,
        realizedRevenue,
        projectedRevenue,
        averageTicket,
      },
      dailyBreakdown,
      serviceBreakdown,
      recentAppointments: appointments.slice(0, 50).map((app) => ({
        id: app.id,
        dateTime: app.dateTime.toISOString(),
        status: app.status,
        clientName: app.client.name,
        clientPhone: app.client.phone,
        serviceName: app.service.name,
        price:
          Number(app.service.price) +
          (app.additionalServices
            ? (app.additionalServices as any[]).reduce((sum, s) => sum + Number(s.price || 0), 0)
            : 0),
      })),
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Erro ao gerar relatório' }, { status: 500 });
  }
}
