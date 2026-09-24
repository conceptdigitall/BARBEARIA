import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface CRMLead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  stage: 'NEW_LEAD' | 'CONFIRMED' | 'COMPLETED' | 'RETURN_DUE' | 'VIP';
  totalAppointments: number;
  completedAppointments: number;
  lifetimeValue: number;
  daysSinceLastVisit: number | null;
  lastVisitDate: string | null;
  lastService: string | null;
  lastBarber: string | null;
  nextAppointment: {
    id: string;
    dateTime: string;
    serviceName: string;
    price: number;
    status: string;
    barberName: string;
  } | null;
  isReturnDue: boolean;
  isUpcomingSoon: boolean;
  recommendedAction: 'RETURN_REMINDER' | 'DATE_APPROACH_REMINDER' | 'CONFIRM_BOOKING' | 'RETAINED';
  whatsappSentAt?: string | null;
  createdAt: string;
}

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

    const now = new Date();

    // Fetch all clients with appointments
    const clients = await prisma.client.findMany({
      where: { tenantId: tenant.id },
      include: {
        appointments: {
          include: {
            service: { select: { name: true, price: true } },
            barber: { select: { name: true } },
          },
          orderBy: { dateTime: 'desc' },
        },
      },
    });

    const leads: CRMLead[] = clients.map((c) => {
      const allAppointments = c.appointments || [];
      const totalAppointments = allAppointments.length;

      // Calculate lifetime value
      let lifetimeValue = 0;
      allAppointments.forEach((app) => {
        if (app.status === 'CONFIRMED' || app.status === 'COMPLETED') {
          lifetimeValue += Number(app.service.price || 0);
          if (app.additionalServices && Array.isArray(app.additionalServices)) {
            (app.additionalServices as any[]).forEach((s) => {
              lifetimeValue += Number(s.price || 0);
            });
          }
        }
      });

      // Find upcoming appointment (future date)
      const upcoming = allAppointments
        .filter((app) => new Date(app.dateTime) >= now && app.status !== 'CANCELED')
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0];

      // Find last past appointment
      const pastAppointments = allAppointments
        .filter((app) => new Date(app.dateTime) < now || app.status === 'COMPLETED')
        .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

      const lastPast = pastAppointments[0] || null;

      let daysSinceLastVisit: number | null = null;
      let lastVisitDate: string | null = null;
      let lastService: string | null = null;
      let lastBarber: string | null = null;

      if (lastPast) {
        lastVisitDate = lastPast.dateTime.toISOString();
        const diffMs = now.getTime() - new Date(lastPast.dateTime).getTime();
        daysSinceLastVisit = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        lastService = lastPast.service?.name || null;
        lastBarber = lastPast.barber?.name || null;
      }

      // Check upcoming soon (within 48h)
      let isUpcomingSoon = false;
      if (upcoming) {
        const msUntil = new Date(upcoming.dateTime).getTime() - now.getTime();
        const hoursUntil = msUntil / (1000 * 60 * 60);
        if (hoursUntil >= 0 && hoursUntil <= 48) {
          isUpcomingSoon = true;
        }
      }

      // Check return due: last visit was 15+ days ago and no upcoming appointment
      const isReturnDue = (daysSinceLastVisit !== null && daysSinceLastVisit >= 15 && !upcoming);

      // Determine Lead Stage in CRM Pipeline
      let stage: CRMLead['stage'] = 'NEW_LEAD';

      if (upcoming) {
        if (upcoming.status === 'PENDING_CONFIRMATION') {
          stage = 'NEW_LEAD';
        } else {
          stage = 'CONFIRMED';
        }
      } else if (isReturnDue) {
        stage = 'RETURN_DUE';
      } else if (totalAppointments >= 3) {
        stage = 'VIP';
      } else if (lastPast) {
        stage = 'COMPLETED';
      } else {
        stage = 'NEW_LEAD';
      }

      // Recommended Action
      let recommendedAction: CRMLead['recommendedAction'] = 'RETAINED';
      if (upcoming && upcoming.status === 'PENDING_CONFIRMATION') {
        recommendedAction = 'CONFIRM_BOOKING';
      } else if (isUpcomingSoon) {
        recommendedAction = 'DATE_APPROACH_REMINDER';
      } else if (isReturnDue) {
        recommendedAction = 'RETURN_REMINDER';
      }

      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        stage,
        totalAppointments,
        completedAppointments: allAppointments.filter((a) => a.status === 'COMPLETED').length,
        lifetimeValue,
        daysSinceLastVisit,
        lastVisitDate,
        lastService,
        lastBarber,
        nextAppointment: upcoming
          ? {
              id: upcoming.id,
              dateTime: upcoming.dateTime.toISOString(),
              serviceName: upcoming.service?.name || 'Serviço',
              price: Number(upcoming.service?.price || 0),
              status: upcoming.status,
              barberName: upcoming.barber?.name || 'Barbeiro',
            }
          : null,
        isReturnDue,
        isUpcomingSoon,
        recommendedAction,
        whatsappSentAt: upcoming?.whatsappSentAt ? upcoming.whatsappSentAt.toISOString() : null,
        createdAt: c.createdAt.toISOString(),
      };
    });

    // Coletar todos os agendamentos da Barbearia para série histórica
    const allAppointmentsFlat = clients.flatMap((c) => c.appointments || []);

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const todayAppointments = allAppointmentsFlat.filter((a) => {
      const d = new Date(a.dateTime);
      return d >= startOfToday && d <= endOfToday;
    });

    const pendingAppointments = allAppointmentsFlat.filter((a) => a.status === 'PENDING_CONFIRMATION');
    const completedToday = todayAppointments.filter((a) => a.status === 'COMPLETED');

    const buildTimeline = (daysCount: number) => {
      const result: { day: string; label: string; scheduled: number; completed: number; revenue: number }[] = [];
      const monthsPt = ['jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
      
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayStr = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
        const isToday = i === 0;
        const label = isToday ? 'Hoje' : `${d.getDate()} de ${monthsPt[d.getMonth()]}`;
        
        const y = d.getFullYear();
        const m = d.getMonth();
        const dateNum = d.getDate();

        const appsOnDay = allAppointmentsFlat.filter((a) => {
          const appD = new Date(a.dateTime);
          return appD.getFullYear() === y && appD.getMonth() === m && appD.getDate() === dateNum;
        });

        const scheduled = appsOnDay.length;
        const completed = appsOnDay.filter((a) => a.status === 'COMPLETED').length;
        const revenue = appsOnDay
          .filter((a) => a.status === 'COMPLETED')
          .reduce((sum, a) => sum + Number(a.service?.price || 0), 0);

        result.push({
          day: dayStr,
          label,
          scheduled,
          completed,
          revenue,
        });
      }
      return result;
    };

    const chartData = {
      days7: buildTimeline(7),
      days30: buildTimeline(30),
      days90: buildTimeline(90),
    };

    // Métricas reais agregadas do banco de dados da Barbearia do Alemão
    const metrics = {
      totalLeads: leads.length,
      returnDueCount: leads.filter((l) => l.stage === 'RETURN_DUE' || l.isReturnDue).length,
      upcomingSoonCount: leads.filter((l) => l.isUpcomingSoon).length,
      vipCount: leads.filter((l) => l.stage === 'VIP' || l.totalAppointments >= 3).length,
      totalPipelineValue: leads.reduce((acc, l) => acc + l.lifetimeValue, 0),
      todayAppointmentsCount: todayAppointments.length,
      pendingConfirmationCount: pendingAppointments.length,
      completedTodayCount: completedToday.length,
      openDealsCount: leads.filter((l) => l.stage === 'CONFIRMED' || l.stage === 'NEW_LEAD').length,
    };

    return NextResponse.json({
      success: true,
      metrics,
      chartData,
      leads,
    });
  } catch (error) {
    console.error('Error in GET /api/admin/crm/leads:', error);
    return NextResponse.json({ error: 'Erro ao carregar leads do CRM' }, { status: 500 });
  }
}
