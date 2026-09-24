import { prisma } from '@/lib/prisma';
import LandingPageWrapper from '@/components/LandingPageWrapper';

export const dynamic = 'force-dynamic'; // Make it dynamic to reflect CMS updates instantly

const DEFAULT_SERVICES = [
  {
    id: 'corte-1',
    name: 'Corte',
    description: 'Corte de cabelo completo (degradê, clássico, social ou moderno) com acabamento impecável.',
    price: 40.00,
    durationMin: 30,
  },
  {
    id: 'barba-1',
    name: 'Barba',
    description: 'Barboterapia com toalha quente, óleo pré-shave, espuma aquecida e pós-barba hidratante.',
    price: 40.00,
    durationMin: 30,
  },
  {
    id: 'combo-1',
    name: 'Corte + Barba (Combo)',
    description: 'A experiência completa: corte de cabelo premium e barboterapia relaxante com toalha quente.',
    price: 75.00,
    durationMin: 60,
  },
  {
    id: 'sobrancelha-1',
    name: 'Sobrancelha',
    description: 'Design de sobrancelha feito com navalha para alinhar perfeitamente o seu rosto.',
    price: 20.00,
    durationMin: 15,
  },
  {
    id: 'pezinho-1',
    name: 'Pezinho',
    description: 'Acabamento do contorno do cabelo (nuca e laterais) para manter o visual limpo.',
    price: 15.00,
    durationMin: 15,
  },
];

export default async function Home() {
  let services = DEFAULT_SERVICES;
  let themeConfig: Record<string, any> = {};

  try {
    const rawServices = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });

    if (rawServices && rawServices.length > 0) {
      services = rawServices.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description || '',
        price: Number(service.price),
        promoPrice: service.promoPrice ? Number(service.promoPrice) : null,
        promoStartDate: service.promoStartDate ? service.promoStartDate.toISOString() : null,
        promoEndDate: service.promoEndDate ? service.promoEndDate.toISOString() : null,
        durationMin: service.durationMin,
        imageUrl: service.imageUrl || null,
      }));
    }

    const tenant = await prisma.tenant.findFirst();
    if (tenant?.themeConfig) {
      themeConfig = tenant.themeConfig as Record<string, any>;
    }
  } catch {
    // Trata graciosamente caso a variável DATABASE_URL ou servidor de banco local não esteja configurado
  }

  const siteConfig = {
    heroName: themeConfig.heroName || 'ALEMÃO 777',
    instagram: themeConfig.instagram || 'https://www.instagram.com/barbeariadoalemao777/',
    whatsapp: themeConfig.whatsapp || '+5513974249209',
    address: themeConfig.address || 'Rua Espanha, 360 - Jardim Casqueiro - Cubatão / SP',
    galleryUrls: themeConfig.galleryUrls || ['/haircut-fade.png', '/haircut-beard.png', '/haircut-classic.png'],
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <LandingPageWrapper services={services} siteConfig={siteConfig} />
    </main>
  );
}
