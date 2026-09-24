import { AppointmentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

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

function parseTimeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatMinutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
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
    const date = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // 1. Fetch Tenant (assuming single-tenant for now, grab the first one)
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ error: 'Nenhuma barbearia cadastrada' }, { status: 404 });
    }

    // 2. Fetch Barbers (Only Alemão / Owner)
    const barbers = await prisma.user.findMany({
      where: {
        tenantId: tenant.id,
        isActive: true,
        ...(barberId ? { id: barberId } : { role: 'OWNER' }),
      },
      include: {
        availabilities: {
          where: { 
            dayOfWeek,
            isActive: true,
          },
        },
      },
    });

    if (barbers.length === 0) {
      return NextResponse.json({ slots: [] });
    }

    // 3. Fetch existing appointments for the day
    const startOfDay = new Date(dateStr + 'T00:00:00');
    const endOfDay = new Date(dateStr + 'T23:59:59');

    const appointments = await prisma.appointment.findMany({
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
    });

    // 4. Calculate available slots
    // A slot is available if at least one barber is available and not booked at that time
    const allSlotsWithBarbers: { [time: string]: string[] } = {}; // time -> array of free barber IDs

    for (const barber of barbers) {
      const availability = barber.availabilities[0];
      if (!availability) continue; // No availability configured for this day

      const barberSlots = generateTimeSlots(
        availability.startTime,
        availability.endTime,
        availability.breakStart,
        availability.breakEnd
      );

      // Filter out slots where this barber already has an appointment
      const barberAppointments = appointments.filter((app) => app.barberId === barber.id);
      const bookedTimes = barberAppointments.map((app) => {
        const d = new Date(app.dateTime);
        // Extract local hours and minutes from the saved UTC DateTime
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      });

      for (const slot of barberSlots) {
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

    return NextResponse.json({ slots: availableSlots });
  } catch (error) {
    console.error('Error in GET /api/appointments:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
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
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ error: 'Nenhuma barbearia cadastrada' }, { status: 404 });
    }

    // 2. Resolve Barber (Always Alemão)
    const dateTime = new Date(`${date}T${time}:00`);
    const defaultBarber = await prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        role: 'OWNER',
        isActive: true,
      },
    });

    if (!defaultBarber) {
      return NextResponse.json({ error: 'Nenhum barbeiro padrão disponível' }, { status: 400 });
    }

    const targetBarberId = defaultBarber.id;

    // Check if the selected barber is already booked
    const conflict = await prisma.appointment.findFirst({
      where: {
        barberId: targetBarberId,
        dateTime,
        status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING_CONFIRMATION] },
      },
    });

    if (conflict) {
      return NextResponse.json({ error: 'Este horário já foi preenchido por outro cliente' }, { status: 400 });
    }

    // 3. Find or Create Client
    let client = await prisma.client.findUnique({
      where: {
        phone_tenantId: {
          phone: clientPhone,
          tenantId: tenant.id,
        },
      },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          name: clientName,
          phone: clientPhone,
          tenantId: tenant.id,
        },
      });
    }

    // 4. Create Appointment
    const appointment = await prisma.appointment.create({
      data: {
        dateTime,
        clientId: client.id,
        barberId: targetBarberId,
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
    });

    // 5. Simulate WhatsApp Message Dispatch
    console.info(`[WhatsApp API Simulation] Sending message to client:`);
    const serviceNames = [
      appointment.service.name,
      ...(additionalServices ? (additionalServices as any[]).map(s => s.name) : [])
    ].join(', ');
    
    console.info(
      `Fala, ${clientName}! 🇩🇪 Seu horário com o barbeiro ${appointment.barber.name} para o(s) serviço(s) ${serviceNames} está pré-reservado para ${date} às ${time}. Confirme seu agendamento no link: http://localhost:3000/confirm/${appointment.id}`
    );

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error('Error in POST /api/appointments:', error);
    return NextResponse.json({ error: 'Erro ao criar agendamento' }, { status: 500 });
  }
}
