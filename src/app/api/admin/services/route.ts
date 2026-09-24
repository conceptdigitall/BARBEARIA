import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: Fetch all services (including inactive) for admin
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    const barbers = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        role: true,
        avatarUrl: true,
      },
    });

    const serialized = services.map((s) => ({
      ...s,
      price: Number(s.price),
      promoPrice: s.promoPrice ? Number(s.promoPrice) : null,
      promoStartDate: s.promoStartDate ? s.promoStartDate.toISOString() : null,
      promoEndDate: s.promoEndDate ? s.promoEndDate.toISOString() : null,
      allowedBarberIds: s.allowedBarberIds ? (s.allowedBarberIds as string[]) : [],
    }));

    return NextResponse.json({ services: serialized, barbers });
  } catch (error) {
    console.error('Error in GET /api/admin/services:', error);

    // Fallback list if DB is offline/unreachable
    const defaultServices = [
      {
        id: 'corte-1',
        name: 'Corte',
        description: 'Corte de cabelo completo (degradê, clássico, social ou moderno) com acabamento impecável.',
        category: 'corte',
        price: 40.0,
        promoPrice: null,
        promoStartDate: null,
        promoEndDate: null,
        durationMin: 30,
        imageUrl: '/haircut-fade.png',
        displayOrder: 1,
        allowedBarberIds: [],
        isActive: true,
      },
      {
        id: 'barba-1',
        name: 'Barba',
        description: 'Barboterapia com toalha quente, óleo pré-shave, espuma aquecida e pós-barba hidratante.',
        category: 'barba',
        price: 40.0,
        promoPrice: null,
        promoStartDate: null,
        promoEndDate: null,
        durationMin: 30,
        imageUrl: '/haircut-beard.png',
        displayOrder: 2,
        allowedBarberIds: [],
        isActive: true,
      },
      {
        id: 'combo-1',
        name: 'Corte + Barba (Combo)',
        description: 'A experiência completa: corte de cabelo premium e barboterapia relaxante com toalha quente.',
        category: 'combo',
        price: 75.0,
        promoPrice: 65.0,
        promoStartDate: new Date().toISOString(),
        promoEndDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        durationMin: 60,
        imageUrl: '/haircut-classic.png',
        displayOrder: 3,
        allowedBarberIds: [],
        isActive: true,
      },
    ];

    const defaultBarbers = [
      { id: 'alemao-owner', name: 'Alemão', role: 'OWNER' },
      { id: 'johann-barber', name: 'Johann', role: 'BARBER' },
    ];

    return NextResponse.json({ services: defaultServices, barbers: defaultBarbers });
  }
}

// POST: Create a new service
export async function POST(request: Request) {
  try {
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

    if (!name || price === undefined || price === null) {
      return NextResponse.json({ error: 'Nome e Preço são obrigatórios.' }, { status: 400 });
    }

    const numericPrice = Number(price);
    const numericPromoPrice = promoPrice !== undefined && promoPrice !== null && promoPrice !== '' ? Number(promoPrice) : null;

    if (numericPromoPrice !== null && numericPromoPrice > numericPrice) {
      return NextResponse.json({ error: 'O preço promocional não pode ser maior que o preço normal.' }, { status: 400 });
    }

    if (promoStartDate && promoEndDate && new Date(promoEndDate) < new Date(promoStartDate)) {
      return NextResponse.json({ error: 'A data final da promoção não pode ser anterior à data inicial.' }, { status: 400 });
    }

    let tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: 'Barbearia do Alemão 777',
          slug: 'barbearia-do-alemao',
        },
      });
    }

    const newService = await prisma.service.create({
      data: {
        name,
        description: description || null,
        category: category || 'corte',
        price: numericPrice,
        promoPrice: numericPromoPrice,
        promoStartDate: promoStartDate ? new Date(promoStartDate) : null,
        promoEndDate: promoEndDate ? new Date(promoEndDate) : null,
        durationMin: Number(durationMin) || 30,
        imageUrl: imageUrl || null,
        displayOrder: Number(displayOrder) || 0,
        allowedBarberIds: allowedBarberIds || [],
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        tenantId: tenant.id,
      },
    });

    return NextResponse.json({
      success: true,
      service: {
        ...newService,
        price: Number(newService.price),
        promoPrice: newService.promoPrice ? Number(newService.promoPrice) : null,
        promoStartDate: newService.promoStartDate ? newService.promoStartDate.toISOString() : null,
        promoEndDate: newService.promoEndDate ? newService.promoEndDate.toISOString() : null,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/admin/services:', error);
    return NextResponse.json({ error: 'Erro ao criar serviço.' }, { status: 500 });
  }
}
