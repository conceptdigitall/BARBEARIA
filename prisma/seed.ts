import { PrismaClient, UserRole } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('Cleaning database...');
  // Clear tables in reverse dependency order
  await prisma.availability.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.tenant.deleteMany({});

  console.log('Creating Tenant...');
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Barbearia do Alemão 777',
      slug: 'barbearia-do-alemao',
      themeConfig: {
        colors: {
          primary: '#C5A880', // Dourado Bronze
          secondary: '#D4AF37', // Dourado Brilhante
          background: '#0D0D0E', // Preto/Grafite Texturizado
          text: '#FFFFFF',
        },
        address: 'Rua Espanha, 360 - Jardim Casqueiro - Cubatão',
        whatsapp: '+5513974249209',
        instagram: 'https://www.instagram.com/barbeariadoalemao777/',
      },
    },
  });

  console.log('Creating Barbers...');
  const alemao = await prisma.user.create({
    data: {
      name: 'Alemão',
      email: 'alemao@barbearia.com',
      passwordHash: hashPassword('alemao123'),
      role: UserRole.OWNER,
      phone: '+5513974249209',
      tenantId: tenant.id,
    },
  });

  const johann = await prisma.user.create({
    data: {
      name: 'Johann',
      email: 'johann@barbearia.com',
      passwordHash: hashPassword('johann123'),
      role: UserRole.BARBER,
      phone: '+5513999999999',
      tenantId: tenant.id,
    },
  });

  console.log('Creating Services...');
  const services = [
    {
      name: 'Corte',
      description: 'Corte de cabelo completo (degradê, clássico, social ou moderno) com acabamento impecável.',
      price: 40.00,
      durationMin: 30,
      tenantId: tenant.id,
    },
    {
      name: 'Barba',
      description: 'Barboterapia com toalha quente, óleo pré-shave, espuma aquecida e pós-barba hidratante.',
      price: 40.00,
      durationMin: 30,
      tenantId: tenant.id,
    },
    {
      name: 'Corte + Barba (Combo)',
      description: 'A experiência completa: corte de cabelo premium e barboterapia relaxante com toalha quente.',
      price: 75.00,
      durationMin: 60,
      tenantId: tenant.id,
    },
    {
      name: 'Sobrancelha',
      description: 'Design de sobrancelha feito com navalha para alinhar perfeitamente o seu rosto.',
      price: 20.00,
      durationMin: 15,
      tenantId: tenant.id,
    },
    {
      name: 'Pezinho',
      description: 'Acabamento do contorno do cabelo (nuca e laterais) para manter o visual limpo.',
      price: 15.00,
      durationMin: 15,
      tenantId: tenant.id,
    },
  ];

  for (const service of services) {
    await prisma.service.create({ data: service });
  }

  console.log('Creating Availabilities...');
  // Monday (1) to Saturday (6)
  const days = [1, 2, 3, 4, 5, 6];
  for (const barber of [alemao, johann]) {
    for (const day of days) {
      await prisma.availability.create({
        data: {
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '19:00',
          breakStart: '12:00',
          breakEnd: '13:00',
          barberId: barber.id,
        },
      });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
