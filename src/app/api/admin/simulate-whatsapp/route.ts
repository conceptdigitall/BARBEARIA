import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { appointmentId } = await request.json();

    if (!appointmentId) {
      return NextResponse.json({ error: 'ID do agendamento é obrigatório' }, { status: 400 });
    }

    // Fetch the appointment with details
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        client: true,
        barber: true,
        service: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }

    // Format local date and time
    const dateStr = new Date(appointment.dateTime).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
    
    const timeStr = new Date(appointment.dateTime).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Generate the WhatsApp message template
    const serviceNames = [
      appointment.service.name,
      ...(appointment.additionalServices ? (appointment.additionalServices as any[]).map(s => s.name) : [])
    ].join(', ');

    const message = `Fala, ${appointment.client.name}! 🇩🇪 Seu horário com o barbeiro *${appointment.barber.name}* para o(s) serviço(s) *${serviceNames}* está confirmado para hoje às *${timeStr}*?

Responda *1* para Confirmar ou *2* para Cancelar/Reagendar.`;

    // Update appointment to simulate that the message was sent
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        whatsappSentAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      phone: appointment.client.phone,
      message,
    });
  } catch (error) {
    console.error('Error simulating WhatsApp:', error);
    return NextResponse.json({ error: 'Erro ao simular envio' }, { status: 500 });
  }
}
