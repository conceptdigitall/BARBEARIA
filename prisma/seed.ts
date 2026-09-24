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
      name: 'Corte + Barba + Sobrancelha (Combo)',
      description: 'Combo completo: corte de cabelo premium, barboterapia relaxante com toalha quente e design de sobrancelha na navalha.',
      price: 90.00,
      durationMin: 75,
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

  console.log('Creating Official Clients for Barbearia do Alemão 777...');
  const clientsData = [
    { name: 'Lucas Silva', phone: '+5513981234567', email: 'lucas.silva@gmail.com' },
    { name: 'Matheus Santos', phone: '+5513991827364', email: 'matheus.santos@gmail.com' },
    { name: 'Gabriel Oliveira', phone: '+5513974123849', email: 'gabriel.oliveira@hotmail.com' },
    { name: 'Felipe Costa', phone: '+5513988456123', email: 'felipe.costa@outlook.com' },
    { name: 'Bruno Almeida', phone: '+5513997654321', email: 'bruno.almeida@gmail.com' },
    { name: 'Rafael Souza', phone: '+5513981129988', email: 'rafael.souza@gmail.com' },
    { name: 'Leonardo Ribeiro', phone: '+5513992345678', email: 'leonardo.ribeiro@yahoo.com' },
    { name: 'Thiago Mendes', phone: '+5513987651122', email: 'thiago.mendes@gmail.com' },
    { name: 'Guilherme Rocha', phone: '+5513993456789', email: 'guilherme.rocha@gmail.com' },
    { name: 'Rodrigo Ferreira', phone: '+5513982341199', email: 'rodrigo.ferreira@gmail.com' },
  ];

  const dbClients: any[] = [];
  for (const c of clientsData) {
    const client = await prisma.client.create({
      data: {
        ...c,
        tenantId: tenant.id,
      },
    });
    dbClients.push(client);
  }

  console.log('Creating Official Appointments history...');
  const dbServices = await prisma.service.findMany({ where: { tenantId: tenant.id } });
  const sCorte = dbServices.find((s) => s.name === 'Corte')!;
  const sBarba = dbServices.find((s) => s.name === 'Barba')!;
  const sCombo = dbServices.find((s) => s.name === 'Corte + Barba (Combo)')!;
  const sComboCompleto = dbServices.find((s) => s.name === 'Corte + Barba + Sobrancelha (Combo)')!;
  const sPezinho = dbServices.find((s) => s.name === 'Pezinho')!;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();

  const createDate = (daysAgo: number, hour: number, min = 0) => {
    return new Date(year, month, date - daysAgo, hour, min, 0, 0);
  };

  const appointmentsList = [
    // HOJE (24/09)
    { clientIdx: 0, barber: alemao, service: sCorte, dateTime: createDate(0, 14, 0), status: 'CONFIRMED' as const },
    { clientIdx: 1, barber: johann, service: sComboCompleto, dateTime: createDate(0, 15, 30), status: 'CONFIRMED' as const },
    { clientIdx: 2, barber: alemao, service: sBarba, dateTime: createDate(0, 17, 0), status: 'PENDING_CONFIRMATION' as const },
    { clientIdx: 3, barber: johann, service: sCombo, dateTime: createDate(0, 18, 0), status: 'CONFIRMED' as const },

    // ONTEM (23/09)
    { clientIdx: 4, barber: alemao, service: sComboCompleto, dateTime: createDate(1, 10, 0), status: 'COMPLETED' as const },
    { clientIdx: 5, barber: johann, service: sCorte, dateTime: createDate(1, 14, 30), status: 'COMPLETED' as const },
    { clientIdx: 6, barber: alemao, service: sBarba, dateTime: createDate(1, 16, 0), status: 'COMPLETED' as const },

    // 22/09 (2 dias atrás)
    { clientIdx: 7, barber: johann, service: sCombo, dateTime: createDate(2, 11, 0), status: 'COMPLETED' as const },
    { clientIdx: 8, barber: alemao, service: sCorte, dateTime: createDate(2, 15, 0), status: 'COMPLETED' as const },

    // 21/09 (3 dias atrás)
    { clientIdx: 9, barber: johann, service: sComboCompleto, dateTime: createDate(3, 16, 30), status: 'COMPLETED' as const },
    { clientIdx: 0, barber: alemao, service: sPezinho, dateTime: createDate(3, 18, 0), status: 'COMPLETED' as const },

    // 20/09 (4 dias atrás)
    { clientIdx: 1, barber: alemao, service: sBarba, dateTime: createDate(4, 14, 0), status: 'COMPLETED' as const },
    { clientIdx: 2, barber: johann, service: sCorte, dateTime: createDate(4, 17, 0), status: 'COMPLETED' as const },

    // 18/09 (6 dias atrás)
    { clientIdx: 3, barber: alemao, service: sComboCompleto, dateTime: createDate(6, 15, 0), status: 'COMPLETED' as const },

    // 15/09 (9 dias atrás)
    { clientIdx: 4, barber: johann, service: sCorte, dateTime: createDate(9, 11, 0), status: 'COMPLETED' as const },
    { clientIdx: 5, barber: alemao, service: sCombo, dateTime: createDate(9, 16, 0), status: 'COMPLETED' as const },

    // 08/09 (16 dias atrás -> RETORNO DEVIDO!)
    { clientIdx: 6, barber: alemao, service: sComboCompleto, dateTime: createDate(16, 14, 0), status: 'COMPLETED' as const },

    // 04/09 (20 dias atrás -> RETORNO DEVIDO!)
    { clientIdx: 7, barber: johann, service: sCorte, dateTime: createDate(20, 10, 0), status: 'COMPLETED' as const },

    // 01/09 (23 dias atrás -> RETORNO DEVIDO!)
    { clientIdx: 8, barber: alemao, service: sCombo, dateTime: createDate(23, 16, 0), status: 'COMPLETED' as const },

    // Clientes VIPs (3+ visitas)
    { clientIdx: 0, barber: alemao, service: sComboCompleto, dateTime: createDate(30, 14, 0), status: 'COMPLETED' as const },
    { clientIdx: 1, barber: johann, service: sComboCompleto, dateTime: createDate(32, 15, 0), status: 'COMPLETED' as const },
  ];

  for (const app of appointmentsList) {
    await prisma.appointment.create({
      data: {
        dateTime: app.dateTime,
        status: app.status,
        tenantId: tenant.id,
        clientId: dbClients[app.clientIdx].id,
        barberId: app.barber.id,
        serviceId: app.service.id,
      },
    });
  }

  console.log('Database seeded with official Barbearia do Alemão 777 data successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
