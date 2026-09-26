import { prisma } from '@/lib/prisma';
import LandingPageWrapper from '@/components/LandingPageWrapper';

export const dynamic = 'force-dynamic'; // Make it dynamic to reflect CMS updates instantly

export default async function Home() {
  let services: Array<{
    id: string;
    name: string;
    description: string | null;
    price: number;
    durationMin: number;
  }> = [
    {
      id: 'default-1',
      name: 'Corte Tradicional / Degradê',
      description: 'Corte moderno ou clássico com acabamento perfeito na navalha e finalização com produtos premium.',
      price: 40,
      durationMin: 35,
    },
    {
      id: 'default-2',
      name: 'Barba Terapia com Toalha Quente',
      description: 'Modelagem completa da barba com navalha, toalha quente aromática e óleos hidratantes.',
      price: 35,
      durationMin: 30,
    },
    {
      id: 'default-combo-sobrancelha',
      name: 'Corte + Barba + Sobrancelha (Combo)',
      description: 'Combo completo: corte de cabelo premium, barboterapia relaxante com toalha quente e design de sobrancelha na navalha.',
      price: 90,
      durationMin: 75,
    },
    {
      id: 'default-4',
      name: 'Acabamento & Pezinho',
      description: 'Alinhamento dos contornos do cabelo e costeletas na navalha.',
      price: 20,
      durationMin: 15,
    },
    {
      id: 'default-5',
      name: 'Sobrancelha na Navalha',
      description: 'Design e alinhamento preciso das sobrancelhas.',
      price: 15,
      durationMin: 10,
    },
  ];

  let siteConfig = {
    heroName: 'ALEMÃO 777',
    instagram: 'https://www.instagram.com/barbeariadoalemao777/',
    whatsapp: '+5513974249209',
    address: 'Rua Espanha, 360 - Jardim Casqueiro - Cubatão / SP',
    galleryUrls: ['/haircut-fade.png', '/haircut-beard.png', '/haircut-classic.png'],
  };

  try {
    const rawServices = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });

    if (rawServices && rawServices.length > 0) {
      services = rawServices
        .filter((service) => service.name !== 'Corte + Barba (Combo)' && service.name !== 'Combo Completo (Corte + Barba)')
        .map((service) => ({
          id: service.id,
          name: service.name,
          description: service.description,
          price: Number(service.price),
          durationMin: service.durationMin,
        }));
    }

    const tenant = await prisma.tenant.findFirst();
    const themeConfig = (tenant?.themeConfig as Record<string, any>) || {};

    siteConfig = {
      heroName: themeConfig.heroName || 'ALEMÃO 777',
      instagram: themeConfig.instagram || 'https://www.instagram.com/barbeariadoalemao777/',
      whatsapp: themeConfig.whatsapp || '+5513974249209',
      address: themeConfig.address || 'Rua Espanha, 360 - Jardim Casqueiro - Cubatão / SP',
      galleryUrls: themeConfig.galleryUrls || ['/haircut-fade.png', '/haircut-beard.png', '/haircut-classic.png'],
    };
  } catch (error) {
    console.error('Database connection warning on Home page:', error);
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <LandingPageWrapper services={services} siteConfig={siteConfig} />
    </main>
  );
}
