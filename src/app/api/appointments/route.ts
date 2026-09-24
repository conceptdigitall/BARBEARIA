import { AppointmentStatus } from '@prisma/client';
import { prisma, withPrismaRetry } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Helper to parse time string "HH:MM" to minutes from 00:00
function parseTimeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper to format minutes back to "HH:MM"
function formatMinutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// Helper to generate time slots (30-minute intervals)
function generateTimeSlots(start: string, end: string, breakStart: string | null, breakEnd: string | null) {
  const slots: string[] = [];
  let current = parseTimeToMinutes(start);
  const endTime = parseTimeToMinutes(end);
  const bStart = breakStart ? parseTimeToMinutes(breakStart) : null;
  const bEnd = breakEnd ? parseTimeToMinutes(breakEnd) : null;

  while (current + 30 <= endTime) {
    const isDuringBreak = bStart !== null && bEnd !== null && current >= bStart && current < bEnd;
    if (!isDuringBreak) {
      slots.push(formatMinutesToTime(current));
    }
    current += 30; // 30 minutes interval
  }
  return slots;
}

// GET: Fetch available slots or appointments
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date'); // YYYY-MM-DD
  const barberId = searchParams.get('barberId');

  if (!dateStr) {
    return NextResponse.json({ error: 'Data é obrigatória' }, { status: 400 });
  }

  try {
    // 1. Calculate dayOfWeek safely with midday UTC to prevent any timezone shifts
    const [year, month, day] = dateStr.split('-').map(Number);
    const middayUtc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const dayOfWeek = middayUtc.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // 2. Fetch Tenant
    const tenant = await withPrismaRetry(() => prisma.tenant.findFirst());
    if (!tenant) {
      return NextResponse.json({ error: 'Nenhuma barbearia cadastrada' }, { status: 404 });
    }

    // 3. Fetch Barbers
    const barberWhere: any = {
      tenantId: tenant.id,
      isActive: true,
    };
    if (barberId && barberId.trim() !== '' && barberId !== 'all') {
      barberWhere.id = barberId.trim();
    } else {
      barberWhere.role = 'OWNER';
    }

    let barbers = await withPrismaRetry(() =>
      prisma.user.findMany({
        where: barberWhere,
        include: {
          availabilities: {
            where: {
              dayOfWeek,
              isActive: true,
            },
          },
        },
      })
    );

    // Fallback: If specific barber has no configuration or wasn't found, find any active barber
    if (barbers.length === 0) {
      barbers = await withPrismaRetry(() =>
        prisma.user.findMany({
          where: {
            tenantId: tenant.id,
            isActive: true,
          },
          include: {
            availabilities: {
              where: {
                dayOfWeek,
                isActive: true,
              },
            },
          },
        })
      );
    }

    if (barbers.length === 0) {
      return NextResponse.json({ slots: [] });
    }

    // 4. Fetch existing appointments for the day in Brazil timezone
    const startOfDay = new Date(`${dateStr}T00:00:00-03:00`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999-03:00`);

    const appointments = await withPrismaRetry(() =>
      prisma.appointment.findMany({
        where: {
          tenantId: tenant.id,
          dateTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING_CONFIRMATION] },
        },
        select: {
          dateTime: true,
          barberId: true,
        },
      })
    );

    // 5. Formatter for appointment times in America/Sao_Paulo (HH:mm)
    const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    // 6. Check if target date is today in Brazil
    const now = new Date();
    const brazilDateFormatted = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now); // DD/MM/YYYY

    const [bDay, bMonth, bYear] = brazilDateFormatted.split('/');
    const todayStrBrazil = `${bYear}-${bMonth}-${bDay}`;
    const isToday = dateStr === todayStrBrazil;

    const currentBrazilTimeStr = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now); // HH:MM

    const currentMinutesToday = parseTimeToMinutes(currentBrazilTimeStr);

    // 7. Calculate available slots across available barbers
    const allSlotsWithBarbers: { [time: string]: string[] } = {};

    for (const barber of barbers) {
      const availability = barber.availabilities[0];
      if (!availability || !availability.isActive) continue;

      const barberSlots = generateTimeSlots(
        availability.startTime,
        availability.endTime,
        availability.breakStart,
        availability.breakEnd
      );

      const barberAppointments = appointments.filter((app) => app.barberId === barber.id);
      const bookedTimes = barberAppointments.map((app) => timeFormatter.format(new Date(app.dateTime)));

      for (const slot of barberSlots) {
        const slotMinutes = parseTimeToMinutes(slot);

        // If checking today, don't allow booking slots that have already passed (give 15min advance buffer)
        if (isToday && slotMinutes <= currentMinutesToday + 15) {
          continue;
        }

        if (!bookedTimes.includes(slot)) {
          if (!allSlotsWithBarbers[slot]) {
            allSlotsWithBarbers[slot] = [];
          }
          allSlotsWithBarbers[slot].push(barber.id);
        }
      }
    }

    // Sort slots chronologically
    const availableSlots = Object.keys(allSlotsWithBarbers).sort();

    return NextResponse.json({
      success: true,
      slots: availableSlots,
      isToday,
      totalSlotsCount: availableSlots.length,
    });
  } catch (error: any) {
    console.warn('Prisma appointments warning (returning default slots):', error?.message);
    // Graceful fallback: return standard business hours slots so client can always book
    const defaultFallbackSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
    ];
    return NextResponse.json({
      success: true,
      slots: defaultFallbackSlots,
      isToday: false,
      totalSlotsCount: defaultFallbackSlots.length,
      isDegraded: true,
    });
  }
}

// POST: Create a new appointment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { serviceId, barberId, date, time, clientName, clientPhone, additionalServices } = body;

    if (!serviceId || !date || !time || !clientName || !clientPhone) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    // 1. Fetch Tenant
    const tenant = await withPrismaRetry(() => prisma.tenant.findFirst());
    if (!tenant) {
      return NextResponse.json({ error: 'Nenhuma barbearia cadastrada' }, { status: 404 });
    }

    // 2. Resolve Barber
    let targetBarber = null;
    if (barberId && barberId.trim() !== '') {
      targetBarber = await withPrismaRetry(() =>
        prisma.user.findFirst({
          where: { id: barberId.trim(), tenantId: tenant.id, isActive: true },
        })
      );
    }
    if (!targetBarber) {
      targetBarber = await withPrismaRetry(() =>
        prisma.user.findFirst({
          where: {
            tenantId: tenant.id,
            role: 'OWNER',
            isActive: true,
          },
        })
      );
    }

    if (!targetBarber) {
      return NextResponse.json({ error: 'Nenhum barbeiro disponível' }, { status: 400 });
    }

    // 3. Create timezone-safe DateTime in Brazil (America/Sao_Paulo UTC-3)
    const dateTime = new Date(`${date}T${time}:00-03:00`);

    // Check if the selected barber is already booked at that exact date and time
    const conflict = await withPrismaRetry(() =>
      prisma.appointment.findFirst({
        where: {
          barberId: targetBarber.id,
          dateTime,
          status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING_CONFIRMATION] },
        },
      })
    );

    if (conflict) {
      return NextResponse.json({ error: 'Este horário já foi preenchido por outro cliente' }, { status: 400 });
    }

    // 4. Find or Create Client
    let client = await withPrismaRetry(() =>
      prisma.client.findUnique({
        where: {
          phone_tenantId: {
            phone: clientPhone,
            tenantId: tenant.id,
          },
        },
      })
    );

    if (!client) {
      client = await withPrismaRetry(() =>
        prisma.client.create({
          data: {
            name: clientName,
            phone: clientPhone,
            tenantId: tenant.id,
          },
        })
      );
    }

    // 5. Create Appointment
    const appointment = await withPrismaRetry(() =>
      prisma.appointment.create({
        data: {
          dateTime,
          clientId: client.id,
          barberId: targetBarber.id,
          serviceId,
          additionalServices: additionalServices || null,
          tenantId: tenant.id,
          status: AppointmentStatus.PENDING_CONFIRMATION,
        },
        include: {
          client: true,
          barber: true,
          service: true,
        },
      })
    );

    // 6. Simulate WhatsApp Message Dispatch
    console.log(`[WhatsApp API Simulation] Sending message to ${clientPhone}:`);
    const serviceNames = [
      appointment.service.name,
      ...(additionalServices ? (additionalServices as any[]).map((s: any) => s.name) : []),
    ].join(', ');

    console.log(
      `Fala, ${clientName}! 🇩🇪 Seu horário com o barbeiro ${appointment.barber.name} para o(s) serviço(s) ${serviceNames} está pré-reservado para ${date} às ${time}. Confirme seu agendamento no link: http://localhost:3000/confirm/${appointment.id}`
    );

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error('Error in POST /api/appointments:', error);
    return NextResponse.json({ error: 'Erro ao criar agendamento' }, { status: 500 });
  }
}
