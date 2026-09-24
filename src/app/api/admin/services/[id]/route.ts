import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// PATCH / PUT: Update service by ID
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      name,
      description,
      category,
      price,
      promoPrice,
      promoStartDate,
      promoEndDate,
      durationMin,
      imageUrl,
      displayOrder,
      allowedBarberIds,
      isActive,
    } = body;

    const numericPrice = price !== undefined ? Number(price) : undefined;
    const numericPromoPrice = promoPrice !== undefined
      ? (promoPrice !== null && promoPrice !== '' ? Number(promoPrice) : null)
      : undefined;

    if (numericPrice !== undefined && numericPromoPrice !== undefined && numericPromoPrice !== null && numericPromoPrice > numericPrice) {
      return NextResponse.json({ error: 'O preço promocional não pode ser maior que o preço normal.' }, { status: 400 });
    }

    if (promoStartDate && promoEndDate && new Date(promoEndDate) < new Date(promoStartDate)) {
      return NextResponse.json({ error: 'A data final da promoção não pode ser anterior à data inicial.' }, { status: 400 });
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(numericPrice !== undefined && { price: numericPrice }),
        ...(numericPromoPrice !== undefined && { promoPrice: numericPromoPrice }),
        ...(promoStartDate !== undefined && { promoStartDate: promoStartDate ? new Date(promoStartDate) : null }),
        ...(promoEndDate !== undefined && { promoEndDate: promoEndDate ? new Date(promoEndDate) : null }),
        ...(durationMin !== undefined && { durationMin: Number(durationMin) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) }),
        ...(allowedBarberIds !== undefined && { allowedBarberIds }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    return NextResponse.json({
      success: true,
      service: {
        ...updatedService,
        price: Number(updatedService.price),
        promoPrice: updatedService.promoPrice ? Number(updatedService.promoPrice) : null,
        promoStartDate: updatedService.promoStartDate ? updatedService.promoStartDate.toISOString() : null,
        promoEndDate: updatedService.promoEndDate ? updatedService.promoEndDate.toISOString() : null,
      },
    });
  } catch (error) {
    console.error('Error in PATCH /api/admin/services/[id]:', error);
    return NextResponse.json({ error: 'Erro ao atualizar serviço.' }, { status: 500 });
  }
}

// DELETE: Delete or deactivate service
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if service has existing appointments
    const appointmentCount = await prisma.appointment.count({
      where: { serviceId: id },
    });

    if (appointmentCount > 0) {
      // Soft delete: mark as inactive to preserve history
      await prisma.service.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({ success: true, message: 'Serviço inativado pois possui histórico de agendamentos.' });
    } else {
      // Hard delete if no appointments exist
      await prisma.service.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, message: 'Serviço removido com sucesso.' });
    }
  } catch (error) {
    console.error('Error in DELETE /api/admin/services/[id]:', error);
    return NextResponse.json({ error: 'Erro ao remover serviço.' }, { status: 500 });
  }
}
