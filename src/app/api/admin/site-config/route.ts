import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { heroName, instagram, whatsapp, address, galleryUrls } = body;

    if (!heroName || !instagram || !whatsapp || !address || !Array.isArray(galleryUrls)) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes ou inválidos' }, { status: 400 });
    }

    // Find the first tenant (assuming single-tenant for now)
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ error: 'Nenhuma barbearia cadastrada' }, { status: 404 });
    }

    // Merge new config with existing config
    const currentThemeConfig = (tenant.themeConfig as Record<string, any>) || {};
    const updatedThemeConfig = {
      ...currentThemeConfig,
      heroName,
      instagram,
      whatsapp,
      address,
      galleryUrls,
    };

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        themeConfig: updatedThemeConfig,
      },
    });

    return NextResponse.json({ success: true, tenant: updatedTenant });
  } catch (error) {
    console.error('Error in POST /api/admin/site-config:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar configurações' }, { status: 500 });
  }
}
