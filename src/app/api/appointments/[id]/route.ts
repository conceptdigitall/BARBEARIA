import { AppointmentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID e status são obrigatórios' }, { status: 400 });
    }

    // Verify if the status is valid
    if (!Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: status as AppointmentStatus,
      },
    });

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    return NextResponse.json({ error: 'Erro ao atualizar agendamento' }, { status: 500 });
  }
}
