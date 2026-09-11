import { prisma } from '@/lib/prisma';
import AdminDashboard from '@/components/AdminDashboard';

export const dynamic = 'force-dynamic'; // Always fetch fresh data for the admin dashboard

export default async function AdminDashboardPage() {
  const today = new Date();
  
  // Get date string in YYYY-MM-DD local format
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  const startOfDay = new Date(dateStr + 'T00:00:00');
  const endOfDay = new Date(dateStr + 'T23:59:59');

  // Fetch all appointments for today
  const rawAppointments = await prisma.appointment.findMany({
    where: {
      dateTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      client: {
        select: {
          name: true,
          phone: true,
        },
      },
      barber: {
        select: {
          name: true,
        },
      },
      service: {
        select: {
          name: true,
          price: true,
        },
      },
    },
    orderBy: {
      dateTime: 'asc',
    },
  });

  // Map to plain objects for client component serialization
  const appointments = rawAppointments.map((app) => ({
    id: app.id,
    dateTime: app.dateTime.toISOString(),
    status: app.status,
    whatsappSentAt: app.whatsappSentAt ? app.whatsappSentAt.toISOString() : null,
    client: {
      name: app.client.name,
      phone: app.client.phone,
    },
    barber: {
      name: app.barber.name,
    },
    service: {
      name: app.service.name,
      price: Number(app.service.price),
    },
    additionalServices: app.additionalServices ? (app.additionalServices as any) : null,
  }));

  // Fetch Tenant data for CMS and analytics
  const tenant = await prisma.tenant.findFirst();
  const views = tenant?.views || 0;

  return (
    <AdminDashboard 
      initialAppointments={appointments} 
      tenant={tenant ? { id: tenant.id, name: tenant.name, themeConfig: tenant.themeConfig } : null}
      views={views} 
    />
  );
}
