'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  DollarSign, 
  Percent, 
  UserCheck, 
  MessageSquare, 
  Check, 
  X, 
  ExternalLink,
  MessageCircle, 
  Clock, 
  Eye, 
  Settings,
  Bell,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Search,
  Filter,
  CalendarDays,
  ChevronRight,
  AlertCircle,
  Sparkles,
  Scissors,
  Users,
  Kanban,
  RotateCcw,
  Award,
  Clock4,
  Flame,
  UserPlus,
  CheckCircle2,
  PhoneCall,
  Send,
  ArrowRight
} from 'lucide-react';
import { CRMSidebar, CRMTabId } from './crm/CRMSidebar';
import { CRMHeader } from './crm/CRMHeader';
import { PainelView } from './crm/PainelView';
import { InboxView } from './crm/InboxView';
import { AutomationsView } from './crm/AutomationsView';

const tabTitles: Record<CRMTabId, string> = {
  painel: 'Painel',
  inbox: 'Caixa de Entrada',
  notifications: 'Notificações',
  contacts: 'Contatos & Clientes CRM',
  pipelines: 'Pipelines & Funil',
  appointments: 'Agendamentos & Horários',
  broadcasts: 'Disparos WhatsApp',
  automations: 'Automações & Gatilhos',
  reports: 'Relatórios & Finanças',
  availability: 'Escala Horária',
  settings: 'Configurações',
};

export interface CRMLead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  stage: 'NEW_LEAD' | 'CONFIRMED' | 'COMPLETED' | 'RETURN_DUE' | 'VIP';
  totalAppointments: number;
  completedAppointments: number;
  lifetimeValue: number;
  daysSinceLastVisit: number | null;
  lastVisitDate: string | null;
  lastService: string | null;
  lastBarber: string | null;
  nextAppointment: {
    id: string;
    dateTime: string;
    serviceName: string;
    price: number;
    status: string;
    barberName: string;
  } | null;
  isReturnDue: boolean;
  isUpcomingSoon: boolean;
  recommendedAction: 'RETURN_REMINDER' | 'DATE_APPROACH_REMINDER' | 'CONFIRM_BOOKING' | 'RETAINED';
  whatsappSentAt?: string | null;
  createdAt: string;
}

interface Appointment {
  id: string;
  dateTime: string;
  status: string;
  whatsappSentAt: string | null;
  client: {
    id?: string;
    name: string;
    phone: string;
  };
  barber: {
    name: string;
  };
  service: {
    name: string;
    price: number;
  };
  additionalServices?: { id: string; name: string; price: number; durationMin: number }[] | null;
}

interface Tenant {
  id: string;
  name: string;
  themeConfig: any;
}

interface AdminDashboardProps {
  initialAppointments: Appointment[];
  tenant: Tenant | null;
  views: number;
}

export default function AdminDashboard({ initialAppointments, tenant, views }: AdminDashboardProps) {
  // Tabs: CRM Standard model
  const [activeTab, setActiveTab] = useState<CRMTabId>('painel');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Date selection state
  const getTodayStr = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  // Filter and search in appointments
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');

  // Simulation & Action modals
  const [simulationResult, setSimulationResult] = useState<{ phone: string; message: string } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // CMS Form State
  const themeConfig = tenant?.themeConfig || {};
  const [heroName, setHeroName] = useState(themeConfig.heroName || 'ALEMÃO 777');
  const [instagram, setInstagram] = useState(themeConfig.instagram || 'https://www.instagram.com/barbeariadoalemao777/');
  const [whatsapp, setWhatsapp] = useState(themeConfig.whatsapp || '+5513974249209');
  const [address, setAddress] = useState(themeConfig.address || 'Rua Espanha, 360 - Jardim Casqueiro - Cubatão / SP');
  
  const defaultGallery = ['/haircut-fade.png', '/haircut-beard.png', '/haircut-classic.png'];
  const initialGallery = themeConfig.galleryUrls || defaultGallery;
  const [gallery1, setGallery1] = useState(initialGallery[0] || '');
  const [gallery2, setGallery2] = useState(initialGallery[1] || '');
  const [gallery3, setGallery3] = useState(initialGallery[2] || '');
  const [savingConfig, setSavingConfig] = useState(false);

  // Availability state (Domingo a Sábado: 0 a 6)
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);

  // WhatsApp notification state
  const [clients, setClients] = useState<any[]>([]);
  const [selectedRecipientType, setSelectedRecipientType] = useState<'manual' | 'today' | 'tomorrow' | 'client'>('manual');
  const [selectedClientId, setSelectedClientId] = useState<string>('manual');
  const [manualPhone, setManualPhone] = useState<string>('');
  const [manualName, setManualName] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('reminder');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [searchClientQuery, setSearchClientQuery] = useState<string>('');
  const [loadingClients, setLoadingClients] = useState(false);

  // Reports state
  const currentDate = new Date();
  const [reportMonth, setReportMonth] = useState<number>(currentDate.getMonth() + 1);
  const [reportYear, setReportYear] = useState<number>(currentDate.getFullYear());
  const [reportData, setReportData] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // CRM & Funil de Leads State
  const [crmLeads, setCrmLeads] = useState<CRMLead[]>([]);
  const [crmMetrics, setCrmMetrics] = useState({
    totalLeads: 0,
    returnDueCount: 0,
    upcomingSoonCount: 0,
    vipCount: 0,
    totalPipelineValue: 0,
  });
  const [loadingCRM, setLoadingCRM] = useState(false);
  const [crmFilter, setCrmFilter] = useState<'ALL' | 'RETURN_DUE' | 'UPCOMING' | 'VIP' | 'NEW'>('ALL');
  const [crmSearch, setCrmSearch] = useState('');
  const [crmView, setCrmView] = useState<'kanban' | 'list'>('kanban');

  // Notification tab state: unread notifications count
  const pendingAppointments = useMemo(() => {
    return appointments.filter(a => a.status === 'PENDING_CONFIRMATION');
  }, [appointments]);

  const pendingReminders = useMemo(() => {
    return appointments.filter(a => a.status === 'CONFIRMED' && !a.whatsappSentAt);
  }, [appointments]);

  const notificationCount = pendingAppointments.length + pendingReminders.length;

  // Format price helper
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Fetch appointments for selected date
  const fetchAppointments = useCallback(async (dateToFetch: string) => {
    setLoadingAppointments(true);
    try {
      const res = await fetch(`/api/admin/appointments?date=${dateToFetch}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
        setLastRefreshedAt(new Date());
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoadingAppointments(false);
    }
  }, []);

  // Fetch Report data
  const fetchReport = useCallback(async (month: number, year: number) => {
    setLoadingReport(true);
    try {
      const res = await fetch(`/api/admin/reports?month=${month}&year=${year}`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoadingReport(false);
    }
  }, []);

  // Fetch CRM Leads
  const fetchCRMLeads = useCallback(async () => {
    setLoadingCRM(true);
    try {
      const res = await fetch('/api/admin/crm/leads');
      if (res.ok) {
        const data = await res.json();
        setCrmLeads(data.leads || []);
        if (data.metrics) {
          setCrmMetrics(data.metrics);
        }
      }
    } catch (err) {
      console.error('Error fetching CRM leads:', err);
    } finally {
      setLoadingCRM(false);
    }
  }, []);

  // WhatsApp Smart Action: Lembrete de Retorno (Fidelização 15-30 dias)
  const handleSendReturnReminder = (lead: CRMLead) => {
    const cleanPhone = lead.phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const days = lead.daysSinceLastVisit ?? 20;
    const serviceInfo = lead.lastService ? ` (${lead.lastService})` : '';
    const text = `Fala, *${lead.name}*! 💈 Barbearia do Alemão 777 passando por aqui.\n\nJá se passaram *${days} dias* desde o seu último corte${serviceInfo}! Que tal manter o degradê e o visual de respeito alinhados para esta semana?\n\nGaranta seu horário com praticidade pelo nosso site ou me avise aqui o melhor dia e horário pra você! ✂️🇩🇪`;
    const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // WhatsApp Smart Action: Notificação de Data Próxima (<48h)
  const handleSendDateApproachNotification = (lead: CRMLead) => {
    if (!lead.nextAppointment) return;
    const cleanPhone = lead.phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const dateFormatted = new Date(lead.nextAppointment.dateTime).toLocaleDateString('pt-BR');
    const timeFormatted = new Date(lead.nextAppointment.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const text = `Olá, *${lead.name}*! 💈 Passando para lembrar do seu corte na Barbearia do Alemão 777 agendado para o dia *${dateFormatted}* às *${timeFormatted}* (${lead.nextAppointment.serviceName}).\n\nTe esperamos no horário combinado! Podemos confirmar sua presença? ✂️🇩🇪`;
    const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // WhatsApp General Direct Message
  const handleDirectLeadWhatsApp = (lead: CRMLead, customGreeting?: string) => {
    const cleanPhone = lead.phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const text = customGreeting || `Olá, *${lead.name}*! 💈 Barbearia do Alemão 777 por aqui. Como posso ajudar você hoje? ✂️`;
    const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Fetch availability, clients, and CRM leads on mount
  useEffect(() => {
    const fetchAvailability = async () => {
      setLoadingAvailability(true);
      try {
        const res = await fetch('/api/admin/availability');
        if (res.ok) {
          const data = await res.json();
          // Support 0 (Sunday) to 6 (Saturday)
          const days = [0, 1, 2, 3, 4, 5, 6];
          const mapped = days.map(dOfWeek => {
            const found = data.availabilities?.find((a: any) => a.dayOfWeek === dOfWeek);
            return found || {
              dayOfWeek: dOfWeek,
              startTime: '09:00',
              endTime: '19:00',
              breakStart: '12:00',
              breakEnd: '13:00',
              isActive: dOfWeek !== 0 // Sunday closed by default
            };
          });
          setAvailabilities(mapped);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAvailability(false);
      }
    };

    const fetchClients = async () => {
      setLoadingClients(true);
      try {
        const res = await fetch('/api/admin/clients');
        if (res.ok) {
          const data = await res.json();
          setClients(data.clients || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingClients(false);
      }
    };

    fetchAvailability();
    fetchClients();
    fetchCRMLeads();
  }, [fetchCRMLeads]);

  // Fetch reports when tab changes or month/year changes
  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReport(reportMonth, reportYear);
    } else if (
      activeTab === 'painel' ||
      activeTab === 'inbox' ||
      activeTab === 'contacts' ||
      activeTab === 'pipelines'
    ) {
      fetchCRMLeads();
    }
  }, [activeTab, reportMonth, reportYear, fetchReport, fetchCRMLeads]);

  // Handle date change
  const handleDateChange = (newDateStr: string) => {
    setSelectedDate(newDateStr);
    fetchAppointments(newDateStr);
  };

  // Live real-time polling (every 30s)
  useEffect(() => {
    if (!autoRefreshEnabled) return;
    const interval = setInterval(() => {
      fetchAppointments(selectedDate);
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefreshEnabled, selectedDate, fetchAppointments]);

  // Update appointment status
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setAppointments(prev => 
          prev.map(app => app.id === id ? { ...app, status: newStatus } : app)
        );
        // Refresh report if report tab was open
        if (activeTab === 'reports') {
          fetchReport(reportMonth, reportYear);
        }
      } else {
        alert('Erro ao atualizar status');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão');
    }
  };

  // WhatsApp simulation
  const handleSimulateWhatsApp = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await fetch('/api/admin/simulate-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id }),
      });
      if (res.ok) {
        const data = await res.json();
        setSimulationResult({ phone: data.phone, message: data.message });
        setAppointments(prev => 
          prev.map(app => app.id === id ? { ...app, whatsappSentAt: new Date().toISOString() } : app)
        );
      } else {
        alert('Erro ao simular disparo');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  // WhatsApp Quick Direct Action from Appointment Row
  const handleDirectWhatsApp = (app: Appointment) => {
    const cleanPhone = app.client.phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const time = new Date(app.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = new Date(app.dateTime).toLocaleDateString('pt-BR');
    const msg = `Olá, *${app.client.name}*! 💈 Passando para lembrar do seu agendamento na Barbearia do Alemão 777 para o serviço *${app.service.name}* no dia *${dateFormatted}* às *${time}*. Confirmado?`;
    
    // Mark as sent locally
    setAppointments(prev => 
      prev.map(a => a.id === app.id ? { ...a, whatsappSentAt: new Date().toISOString() } : a)
    );

    const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // CMS Save Config Handler
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroName,
          instagram,
          whatsapp,
          address,
          galleryUrls: [gallery1, gallery2, gallery3],
        }),
      });

      if (res.ok) {
        alert('Configurações salvas com sucesso!');
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao salvar configurações.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao salvar.');
    } finally {
      setSavingConfig(false);
    }
  };

  // Availability Save Config Handler
  const handleSaveAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAvailability(true);
    try {
      const res = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availabilities }),
      });
      if (res.ok) {
        alert('Escala de horários salva com sucesso!');
      } else {
        alert('Erro ao salvar escala.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao salvar disponibilidade.');
    } finally {
      setSavingAvailability(false);
    }
  };

  // Apply WhatsApp Template
  const handleApplyTemplate = (type: string, clientNameOverride?: string) => {
    setSelectedTemplate(type);
    const nameStr = clientNameOverride || manualName || '{Nome}';
    let msg = '';
    if (type === 'reminder') {
      msg = `Olá, *${nameStr}*! 💈 Passando para lembrar do seu agendamento na Barbearia do Alemão 777! Posso confirmar o seu horário?`;
    } else if (type === 'confirm') {
      msg = `Fala, *${nameStr}*! ✂️ Seu agendamento na Barbearia do Alemão 777 foi confirmado com sucesso! Te esperamos no horário combinado. Qualquer dúvida estamos à disposição!`;
    } else if (type === 'promo') {
      msg = `Fala, *${nameStr}*! 🇩🇪 Que tal dar aquele trato de respeito no visual esta semana? Garanta seu horário online com rapidez: http://localhost:3000`;
    } else if (type === 'feedback') {
      msg = `Fala, *${nameStr}*! 💈 Valeu demais pela preferência no seu último corte na Barbearia do Alemão! Ficou satisfeito com o resultado? Seu feedback é muito importante pra gente!`;
    } else {
      msg = '';
    }
    setCustomMessage(msg);
  };

  // Send WhatsApp message
  const handleSendWhatsAppMessage = () => {
    if (!manualPhone) {
      alert('Por favor informe o telefone do destinatário.');
      return;
    }
    const cleanPhone = manualPhone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const text = customMessage.replace('{Nome}', manualName || '');
    const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Filtered appointments for current list
  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
      const matchesSearch =
        searchQuery === '' ||
        app.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.client.phone.includes(searchQuery) ||
        app.service.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [appointments, statusFilter, searchQuery]);

  // Metrics for the currently selected day
  const totalBookings = appointments.length;
  const estimatedRevenue = appointments
    .filter(app => app.status === 'CONFIRMED' || app.status === 'COMPLETED')
    .reduce((sum, app) => {
      const mainPrice = Number(app.service.price);
      const additionalPrice = app.additionalServices
        ? (app.additionalServices as any[]).reduce((s: number, service: any) => s + Number(service.price), 0)
        : 0;
      return sum + mainPrice + additionalPrice;
    }, 0);

  const completedCount = appointments.filter(app => app.status === 'COMPLETED').length;
  const totalSlots = 18;
  const occupiedSlots = appointments.filter(app => app.status !== 'CANCELED').length;
  const occupancyRate = totalBookings > 0 ? Math.min(Math.round((occupiedSlots / totalSlots) * 100), 100) : 0;

  // Generate day slots for timeline view
  const timelineSlots = useMemo(() => {
    const slots = [];
    // 09:00 to 19:00 in 30min steps
    for (let h = 9; h <= 18; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
      slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    slots.push('19:00');
    return slots;
  }, []);

  const dayNames = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado'
  ];

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="min-h-screen flex bg-[#090d16] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Sidebar Desktop & Mobile Drawer */}
      <CRMSidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'pipelines') setCrmView('kanban');
          if (tab === 'contacts') setCrmView('list');
        }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        notificationCount={notificationCount}
        returnDueCount={crmMetrics.returnDueCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <CRMHeader
          title={tabTitles[activeTab]}
          onOpenSidebar={() => setSidebarOpen(true)}
          onRefresh={() => fetchAppointments(selectedDate)}
          loading={loadingAppointments}
          autoRefresh={autoRefreshEnabled}
          onToggleAutoRefresh={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Painel: Exact CRM Standard Template */}
          {activeTab === 'painel' && (
            <PainelView
              appointments={appointments}
              crmLeads={crmLeads}
              crmMetrics={crmMetrics}
              onSelectTab={(tab) => {
                setActiveTab(tab);
                if (tab === 'pipelines') setCrmView('kanban');
                if (tab === 'contacts') setCrmView('list');
              }}
              onSendReturnReminder={handleSendReturnReminder}
              onSendDateApproachNotification={handleSendDateApproachNotification}
              onDirectWhatsApp={handleDirectWhatsApp}
            />
          )}

          {/* Inbox: WhatsApp Chat Simulation */}
          {activeTab === 'inbox' && (
            <InboxView
              crmLeads={crmLeads}
              onSendReturnReminder={handleSendReturnReminder}
              onSendDateApproachNotification={handleSendDateApproachNotification}
            />
          )}

          {/* Automations: Intelligent WhatsApp triggers */}
          {activeTab === 'automations' && (
            <AutomationsView />
          )}

          {/* ========================================================================= */}
          {/* TAB: AGENDA EM TEMPO REAL & GESTÃO DE HORÁRIOS */}
          {/* ========================================================================= */}
          {activeTab === 'appointments' && (
          <div className="space-y-6">
            
            {/* Quick Date Picker & View Switcher Bar */}
            <div className="glass-panel p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border border-gold-primary/10">
              {/* Date selection shortcuts */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-white/40 font-bold mr-1">Data:</span>
                
                <button
                  onClick={() => handleDateChange(getTodayStr())}
                  className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider border transition-all ${
                    selectedDate === getTodayStr()
                      ? 'bg-gold-primary text-black border-gold-primary shadow-sm shadow-gold-primary/20'
                      : 'bg-graphite-dark text-white/70 border-graphite-border hover:text-white'
                  }`}
                >
                  Hoje
                </button>

                <button
                  onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    const y = tomorrow.getFullYear();
                    const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
                    const d = String(tomorrow.getDate()).padStart(2, '0');
                    handleDateChange(`${y}-${m}-${d}`);
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider bg-graphite-dark text-white/70 border border-graphite-border hover:text-white transition-all"
                >
                  Amanhã
                </button>

                <div className="flex items-center gap-2 bg-graphite-dark border border-graphite-border px-3 py-1 text-xs text-white">
                  <CalendarDays className="w-4 h-4 text-gold-primary" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => e.target.value && handleDateChange(e.target.value)}
                    className="bg-transparent text-white outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* View mode toggle: Table vs Timeline */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                <span className="text-xs text-white/40 font-bold uppercase tracking-wider mr-1 hidden sm:inline">Visualização:</span>
                <div className="flex bg-graphite-dark border border-graphite-border p-0.5">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                      viewMode === 'table' ? 'bg-gold-primary text-black' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Tabela
                  </button>
                  <button
                    onClick={() => setViewMode('timeline')}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                      viewMode === 'timeline' ? 'bg-gold-primary text-black' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Linha do Tempo
                  </button>
                </div>
              </div>
            </div>

            {/* Metrics Cards Grid for Selected Day */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Card 1: Faturamento Previsto do Dia */}
              <div className="glass-panel p-5 flex items-center justify-between border border-gold-primary/10">
                <div>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Faturamento (Dia)</span>
                  <h3 className="text-2xl font-bold text-gold-primary font-serif mt-1">
                    {formatPrice(estimatedRevenue)}
                  </h3>
                  <p className="text-[10px] text-white/40 mt-1">{completedCount} atendimento(s) concluído(s)</p>
                </div>
                <div className="p-3 bg-gold-primary/10 border border-gold-primary/20 text-gold-primary">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              {/* Card 2: Taxa de Ocupação */}
              <div className="glass-panel p-5 flex items-center justify-between border border-gold-primary/10">
                <div>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Ocupação da Grade</span>
                  <h3 className="text-2xl font-bold text-white font-serif mt-1">
                    {occupancyRate}%
                  </h3>
                  <p className="text-[10px] text-white/40 mt-1">{occupiedSlots} de {totalSlots} horários</p>
                </div>
                <div className="p-3 bg-gold-primary/10 border border-gold-primary/20 text-gold-primary">
                  <Percent className="w-5 h-5" />
                </div>
              </div>

              {/* Card 3: Total de Agendamentos */}
              <div className="glass-panel p-5 flex items-center justify-between border border-gold-primary/10">
                <div>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Agendamentos</span>
                  <h3 className="text-2xl font-bold text-white font-serif mt-1">
                    {totalBookings}
                  </h3>
                  <p className="text-[10px] text-white/40 mt-1">Data: {selectedDate.split('-').reverse().join('/')}</p>
                </div>
                <div className="p-3 bg-gold-primary/10 border border-gold-primary/20 text-gold-primary">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>

              {/* Card 4: Visitas no Site */}
              <div className="glass-panel p-5 flex items-center justify-between border border-gold-primary/10">
                <div>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Visitas no Site</span>
                  <h3 className="text-2xl font-bold text-white font-serif mt-1">
                    {views}
                  </h3>
                  <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    Página Ativa
                  </p>
                </div>
                <div className="p-3 bg-gold-primary/10 border border-gold-primary/20 text-gold-primary">
                  <Eye className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* View Mode 1: Table View */}
            {viewMode === 'table' && (
              <div className="glass-panel overflow-hidden border border-gold-primary/10">
                {/* Search & Filter Header */}
                <div className="p-4 border-b border-graphite-border bg-graphite-dark/40 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-serif text-base sm:text-lg font-bold text-white uppercase tracking-wider">
                      Agendamentos de {selectedDate.split('-').reverse().join('/')}
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded bg-gold-primary/10 text-gold-primary border border-gold-primary/20">
                      {filteredAppointments.length} listado(s)
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Search Input */}
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar cliente, serviço..."
                        className="w-full pl-8 pr-3 py-1.5 bg-graphite-light border border-graphite-border focus:border-gold-primary text-xs text-white outline-none"
                      />
                    </div>

                    {/* Status filter buttons */}
                    <div className="flex bg-graphite-dark border border-graphite-border p-0.5 text-[11px]">
                      {['ALL', 'CONFIRMED', 'PENDING_CONFIRMATION', 'COMPLETED', 'CANCELED'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setStatusFilter(st)}
                          className={`px-2.5 py-1 font-bold uppercase transition-colors ${
                            statusFilter === st ? 'bg-gold-primary text-black' : 'text-white/40 hover:text-white'
                          }`}
                        >
                          {st === 'ALL' ? 'Todos' :
                           st === 'CONFIRMED' ? 'Confirmados' :
                           st === 'PENDING_CONFIRMATION' ? 'Pendentes' :
                           st === 'COMPLETED' ? 'Concluídos' : 'Cancelados'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {loadingAppointments ? (
                  <div className="p-12 text-center text-white/40 flex items-center justify-center gap-3">
                    <RefreshCw className="w-5 h-5 animate-spin text-gold-primary" />
                    <span>Carregando agenda em tempo real...</span>
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="p-12 text-center text-white/40 text-sm font-light">
                    Nenhum agendamento encontrado para esta data ou filtro selecionado.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-graphite-border text-white/40 text-[10px] uppercase tracking-wider bg-black/20">
                          <th className="px-5 py-3.5 font-bold">Horário</th>
                          <th className="px-5 py-3.5 font-bold">Cliente</th>
                          <th className="px-5 py-3.5 font-bold">Serviço</th>
                          <th className="px-5 py-3.5 font-bold text-right">Valor</th>
                          <th className="px-5 py-3.5 font-bold text-center">Status</th>
                          <th className="px-5 py-3.5 font-bold text-center">Lembrete</th>
                          <th className="px-5 py-3.5 font-bold text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-graphite-border/50 text-sm">
                        {filteredAppointments.map((app) => {
                          const appTime = new Date(app.dateTime).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          });

                          return (
                            <tr key={app.id} className="hover:bg-white/5 transition-colors duration-150">
                              <td className="px-5 py-3.5 font-bold text-gold-primary flex items-center gap-2 whitespace-nowrap">
                                <Clock className="w-4 h-4 text-gold-primary/60" />
                                {appTime}
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="font-semibold text-white">{app.client.name}</div>
                                <div className="text-xs text-white/40 flex items-center gap-1.5 mt-0.5">
                                  <MessageCircle className="w-3 h-3 text-emerald-400" />
                                  {app.client.phone}
                                </div>
                              </td>
                              <td className="px-5 py-3.5 text-white/80">
                                <div>{app.service.name}</div>
                                {app.additionalServices && app.additionalServices.length > 0 && (
                                  <div className="text-[11px] text-gold-primary/80 mt-0.5">
                                    + {app.additionalServices.map((s: any) => s.name).join(', ')}
                                  </div>
                                )}
                              </td>
                              <td className="px-5 py-3.5 text-right font-bold text-white whitespace-nowrap">
                                {formatPrice(
                                  app.service.price +
                                    (app.additionalServices
                                      ? (app.additionalServices as any[]).reduce((s, service) => s + Number(service.price), 0)
                                      : 0)
                                )}
                              </td>
                              <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                <span className={`px-2.5 py-1 text-[9px] uppercase font-bold tracking-wider rounded-sm ${
                                  app.status === 'CONFIRMED' ? 'bg-gold-primary/10 text-gold-primary border border-gold-primary/30' :
                                  app.status === 'PENDING_CONFIRMATION' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                  app.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                  'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                  {app.status === 'CONFIRMED' ? 'Confirmado' :
                                   app.status === 'PENDING_CONFIRMATION' ? 'Pendente' :
                                   app.status === 'COMPLETED' ? 'Finalizado' : 'Cancelado'}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-center whitespace-nowrap text-xs">
                                {app.whatsappSentAt ? (
                                  <span className="text-emerald-400 flex items-center justify-center gap-1 text-[11px]">
                                    <Check className="w-3.5 h-3.5" />
                                    Enviado
                                  </span>
                                ) : (
                                  <span className="text-white/30 text-[11px]">Pendente</span>
                                )}
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center justify-center gap-1.5">
                                  {/* Direct WhatsApp Action */}
                                  <button
                                    onClick={() => handleDirectWhatsApp(app)}
                                    title="Disparar Lembrete WhatsApp"
                                    className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/20 transition-all duration-150"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Confirm Button (if pending) */}
                                  {app.status === 'PENDING_CONFIRMATION' && (
                                    <button
                                      onClick={() => handleUpdateStatus(app.id, 'CONFIRMED')}
                                      title="Confirmar Agendamento"
                                      className="p-1.5 bg-gold-primary/10 hover:bg-gold-primary text-gold-primary hover:text-black border border-gold-primary/20 transition-all duration-150"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* Complete Button */}
                                  {app.status !== 'COMPLETED' && app.status !== 'CANCELED' && (
                                    <button
                                      onClick={() => handleUpdateStatus(app.id, 'COMPLETED')}
                                      title="Finalizar Atendimento"
                                      className="p-1.5 bg-white/5 hover:bg-white/20 text-white/80 hover:text-white border border-white/10 transition-all duration-150"
                                    >
                                      <Scissors className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* Cancel Button */}
                                  {app.status !== 'CANCELED' && app.status !== 'COMPLETED' && (
                                    <button
                                      onClick={() => handleUpdateStatus(app.id, 'CANCELED')}
                                      title="Cancelar Agendamento"
                                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-black border border-rose-500/20 transition-all duration-150"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* View Mode 2: Timeline View (Grade Horária) */}
            {viewMode === 'timeline' && (
              <div className="glass-panel p-6 border border-gold-primary/10 space-y-4">
                <div className="flex justify-between items-center border-b border-graphite-border pb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider">
                      Grade Horária & Ocupação do Dia
                    </h3>
                    <p className="text-xs text-white/40">Visualização de todos os slots de 30 minutos em tempo real</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-white/60">
                      <span className="w-2.5 h-2.5 bg-gold-primary/20 border border-gold-primary" /> Ocupado
                    </span>
                    <span className="flex items-center gap-1.5 text-white/60">
                      <span className="w-2.5 h-2.5 bg-white/5 border border-graphite-border" /> Livre
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {timelineSlots.map((timeSlot) => {
                    const booked = appointments.find((app) => {
                      const appTime = new Date(app.dateTime).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      return appTime === timeSlot && app.status !== 'CANCELED';
                    });

                    return (
                      <div
                        key={timeSlot}
                        className={`p-3.5 border transition-all duration-200 flex items-start justify-between gap-3 ${
                          booked
                            ? booked.status === 'COMPLETED'
                              ? 'bg-emerald-950/20 border-emerald-500/30'
                              : booked.status === 'PENDING_CONFIRMATION'
                              ? 'bg-amber-950/20 border-amber-500/30'
                              : 'bg-gold-primary/5 border-gold-primary/40'
                            : 'bg-graphite-dark/30 border-graphite-border hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className={`w-4 h-4 ${booked ? 'text-gold-primary' : 'text-white/30'}`} />
                          <span className={`font-mono text-xs font-bold ${booked ? 'text-gold-primary' : 'text-white/50'}`}>
                            {timeSlot}
                          </span>
                        </div>

                        {booked ? (
                          <div className="flex-1 text-right">
                            <div className="text-xs font-semibold text-white truncate">{booked.client.name}</div>
                            <div className="text-[11px] text-white/60 truncate">{booked.service.name}</div>
                            <div className="flex items-center justify-end gap-2 mt-1.5">
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/5 text-gold-primary">
                                {booked.status === 'CONFIRMED' ? 'Confirmado' :
                                 booked.status === 'PENDING_CONFIRMATION' ? 'Pendente' :
                                 booked.status === 'COMPLETED' ? 'Finalizado' : booked.status}
                              </span>
                              <button
                                onClick={() => handleDirectWhatsApp(booked)}
                                title="WhatsApp"
                                className="p-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black rounded transition-colors"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-right">
                            <span className="text-[10px] text-white/30 font-semibold uppercase tracking-wider">
                              Disponível
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: CRM CONCEPT — CONTATOS & PIPELINES DE VENDAS */}
        {/* ========================================================================= */}
        {(activeTab === 'contacts' || activeTab === 'pipelines') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Top CRM Banner with Alemão 777 Luxury Aesthetic */}
            <div className="glass-panel p-6 sm:p-8 border border-gold-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gold-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold-primary bg-gold-primary/10 border border-gold-primary/20 px-3 py-1">
                      CRM Concept • Engenharia de Vendas
                    </span>
                    <span className="text-xs text-white/40">• Barbearia do Alemão 777</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white uppercase tracking-wider flex items-center gap-3">
                    <Users className="w-7 h-7 text-gold-primary" />
                    <span>Funil de Leads & Fidelização de Clientes</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-white/50 max-w-2xl mt-1.5 leading-relaxed">
                    Sincronização em tempo real de agendamentos como leads, gestão do ciclo de vida dos clientes, lembretes de retorno (15 a 30+ dias) e notificações proativas de data no WhatsApp.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={fetchCRMLeads}
                    disabled={loadingCRM}
                    className="px-4 py-2.5 bg-graphite-dark hover:bg-white/5 border border-graphite-border hover:border-gold-primary/40 text-xs font-semibold text-white/80 hover:text-gold-primary flex items-center gap-2 transition-all shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingCRM ? 'animate-spin text-gold-primary' : ''}`} />
                    <span>Sincronizar Leads</span>
                  </button>

                  {/* View Mode Switcher */}
                  <div className="flex items-center bg-graphite-dark border border-graphite-border p-1">
                    <button
                      onClick={() => setCrmView('kanban')}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                        crmView === 'kanban'
                          ? 'bg-gold-primary text-black shadow-sm'
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      <Kanban className="w-3.5 h-3.5" />
                      Funil Kanban
                    </button>
                    <button
                      onClick={() => setCrmView('list')}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                        crmView === 'list'
                          ? 'bg-gold-primary text-black shadow-sm'
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Lista Geral
                    </button>
                  </div>
                </div>
              </div>

              {/* 5 Quick KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-8 pt-6 border-t border-graphite-border/70">
                {/* Metric 1 */}
                <div className="p-4 bg-graphite-dark/60 border border-graphite-border/60 relative group hover:border-gold-primary/30 transition-all">
                  <div className="flex items-center justify-between text-white/40 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Total de Leads</span>
                    <Users className="w-4 h-4 text-gold-primary" />
                  </div>
                  <div className="text-2xl font-serif font-bold text-white">{crmMetrics.totalLeads}</div>
                  <span className="text-[10px] text-white/40">Base de clientes ativa</span>
                </div>

                {/* Metric 2: Retorno Pendente */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 relative group hover:border-amber-500 transition-all">
                  <div className="flex items-center justify-between text-amber-400 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Retorno Pendente</span>
                    <RotateCcw className="w-4 h-4 animate-spin-slow" />
                  </div>
                  <div className="text-2xl font-serif font-bold text-amber-400">{crmMetrics.returnDueCount}</div>
                  <span className="text-[10px] text-amber-300/70 font-medium">15 a 30+ dias sem cortar</span>
                </div>

                {/* Metric 3: Cortes Próximos */}
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 relative group hover:border-emerald-500 transition-all">
                  <div className="flex items-center justify-between text-emerald-400 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Cortes se Aproximando</span>
                    <Clock4 className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-serif font-bold text-emerald-400">{crmMetrics.upcomingSoonCount}</div>
                  <span className="text-[10px] text-emerald-300/70 font-medium">Próximas 24h a 48h</span>
                </div>

                {/* Metric 4: VIPs */}
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 relative group hover:border-purple-500 transition-all">
                  <div className="flex items-center justify-between text-purple-400 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Clientes VIPs</span>
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-serif font-bold text-purple-300">{crmMetrics.vipCount}</div>
                  <span className="text-[10px] text-purple-300/70 font-medium">3+ cortes realizados</span>
                </div>

                {/* Metric 5: LTV Total */}
                <div className="p-4 bg-graphite-dark/60 border border-graphite-border/60 relative group hover:border-gold-primary/30 transition-all col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between text-white/40 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider">LTV Acumulado</span>
                    <DollarSign className="w-4 h-4 text-gold-primary" />
                  </div>
                  <div className="text-2xl font-serif font-bold text-gold-primary">
                    {formatPrice(crmMetrics.totalPipelineValue)}
                  </div>
                  <span className="text-[10px] text-white/40">Faturamento em clientes</span>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="glass-panel p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border border-gold-primary/10">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={crmSearch}
                  onChange={(e) => setCrmSearch(e.target.value)}
                  placeholder="Buscar lead por nome, telefone ou serviço..."
                  className="w-full pl-10 pr-4 py-2 bg-graphite-dark border border-graphite-border focus:border-gold-primary text-white text-xs outline-none"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-white/40 font-bold mr-1">Filtrar:</span>
                
                <button
                  onClick={() => setCrmFilter('ALL')}
                  className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border transition-all ${
                    crmFilter === 'ALL'
                      ? 'bg-gold-primary text-black border-gold-primary'
                      : 'bg-graphite-dark text-white/70 border-graphite-border hover:text-white'
                  }`}
                >
                  Todos ({crmLeads.length})
                </button>

                <button
                  onClick={() => setCrmFilter('RETURN_DUE')}
                  className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                    crmFilter === 'RETURN_DUE'
                      ? 'bg-amber-500 text-black border-amber-500 font-bold'
                      : 'bg-graphite-dark text-amber-400 border-amber-500/30 hover:border-amber-500'
                  }`}
                >
                  <RotateCcw className="w-3 h-3" />
                  Retorno Pendente ({crmMetrics.returnDueCount})
                </button>

                <button
                  onClick={() => setCrmFilter('UPCOMING')}
                  className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                    crmFilter === 'UPCOMING'
                      ? 'bg-emerald-500 text-black border-emerald-500 font-bold'
                      : 'bg-graphite-dark text-emerald-400 border-emerald-500/30 hover:border-emerald-500'
                  }`}
                >
                  <Clock4 className="w-3 h-3" />
                  Cortes Próximos ({crmMetrics.upcomingSoonCount})
                </button>

                <button
                  onClick={() => setCrmFilter('VIP')}
                  className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                    crmFilter === 'VIP'
                      ? 'bg-purple-500 text-black border-purple-500 font-bold'
                      : 'bg-graphite-dark text-purple-300 border-purple-500/30 hover:border-purple-500'
                  }`}
                >
                  <Award className="w-3 h-3" />
                  VIPs ({crmMetrics.vipCount})
                </button>
              </div>
            </div>

            {/* Main CRM View: KANBAN BOARD */}
            {crmView === 'kanban' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-start">
                {[
                  {
                    stageId: 'NEW_LEAD',
                    title: 'Novos Leads',
                    subtitle: 'A Confirmar Horário',
                    color: 'border-amber-500/40',
                    headerBg: 'bg-amber-500/10',
                    textCol: 'text-amber-400',
                    dotCol: 'bg-amber-400',
                  },
                  {
                    stageId: 'CONFIRMED',
                    title: 'Confirmados',
                    subtitle: 'Próximos Agendamentos',
                    color: 'border-emerald-500/40',
                    headerBg: 'bg-emerald-500/10',
                    textCol: 'text-emerald-400',
                    dotCol: 'bg-emerald-400',
                  },
                  {
                    stageId: 'COMPLETED',
                    title: 'Atendidos Recentes',
                    subtitle: 'Visual em Dia (<14d)',
                    color: 'border-blue-500/40',
                    headerBg: 'bg-blue-500/10',
                    textCol: 'text-blue-400',
                    dotCol: 'bg-blue-400',
                  },
                  {
                    stageId: 'RETURN_DUE',
                    title: 'Retorno Pendente',
                    subtitle: '15 a 30+ dias s/ corte',
                    color: 'border-gold-primary/70',
                    headerBg: 'bg-gold-primary/15',
                    textCol: 'text-gold-primary',
                    dotCol: 'bg-gold-primary',
                    highlight: true,
                  },
                  {
                    stageId: 'VIP',
                    title: 'Clientes VIPs',
                    subtitle: 'Frequência Contínua',
                    color: 'border-purple-500/40',
                    headerBg: 'bg-purple-500/10',
                    textCol: 'text-purple-400',
                    dotCol: 'bg-purple-400',
                  },
                ].map((col) => {
                  // Filter leads for this column
                  const columnLeads = crmLeads.filter((lead) => {
                    const matchesSearch =
                      crmSearch === '' ||
                      lead.name.toLowerCase().includes(crmSearch.toLowerCase()) ||
                      lead.phone.includes(crmSearch) ||
                      (lead.lastService && lead.lastService.toLowerCase().includes(crmSearch.toLowerCase())) ||
                      (lead.nextAppointment && lead.nextAppointment.serviceName.toLowerCase().includes(crmSearch.toLowerCase()));

                    if (!matchesSearch) return false;

                    if (crmFilter === 'RETURN_DUE') return lead.isReturnDue || lead.stage === 'RETURN_DUE';
                    if (crmFilter === 'UPCOMING') return lead.isUpcomingSoon || (lead.nextAppointment !== null);
                    if (crmFilter === 'VIP') return lead.stage === 'VIP' || lead.totalAppointments >= 3;
                    if (crmFilter === 'NEW') return lead.stage === 'NEW_LEAD';

                    return lead.stage === col.stageId;
                  });

                  const colTotalValue = columnLeads.reduce((sum, l) => sum + l.lifetimeValue, 0);

                  return (
                    <div
                      key={col.stageId}
                      className={`glass-panel border ${col.color} p-3.5 space-y-3 min-h-[500px] flex flex-col ${
                        col.highlight ? 'shadow-[0_0_20px_rgba(197,168,128,0.1)]' : ''
                      }`}
                    >
                      {/* Column Header */}
                      <div className={`p-3 ${col.headerBg} border-b ${col.color} flex justify-between items-start`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${col.dotCol} ${col.highlight ? 'animate-pulse' : ''}`} />
                            <h4 className={`font-serif font-bold text-xs uppercase tracking-wider ${col.textCol}`}>
                              {col.title}
                            </h4>
                          </div>
                          <p className="text-[10px] text-white/40 mt-0.5">{col.subtitle}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded-full ${col.headerBg} ${col.textCol} border ${col.color}`}>
                          {columnLeads.length}
                        </span>
                      </div>

                      {/* Column Total LTV */}
                      <div className="text-[11px] text-white/50 px-1 flex justify-between items-center">
                        <span>LTV da coluna:</span>
                        <span className="font-bold text-white font-mono">{formatPrice(colTotalValue)}</span>
                      </div>

                      {/* Leads Cards Container */}
                      <div className="space-y-3 flex-1 overflow-y-auto max-h-[680px] pr-1">
                        {loadingCRM ? (
                          <div className="py-12 text-center text-white/40 text-xs">
                            <RefreshCw className="w-4 h-4 animate-spin text-gold-primary mx-auto mb-2" />
                            <span>Carregando leads...</span>
                          </div>
                        ) : columnLeads.length === 0 ? (
                          <div className="py-10 text-center text-white/30 text-[11px] border border-dashed border-white/10 p-4">
                            Nenhum lead nesta etapa
                          </div>
                        ) : (
                          columnLeads.map((lead) => (
                            <div
                              key={lead.id}
                              className={`p-3.5 bg-graphite-dark/80 hover:bg-graphite-dark border transition-all duration-200 space-y-2.5 ${
                                lead.isReturnDue
                                  ? 'border-gold-primary/50 shadow-sm shadow-gold-primary/10'
                                  : lead.isUpcomingSoon
                                  ? 'border-emerald-500/50 shadow-sm shadow-emerald-500/10'
                                  : 'border-graphite-border hover:border-white/20'
                              }`}
                            >
                              {/* Lead Header */}
                              <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0">
                                  <h5 className="font-bold text-white text-xs truncate flex items-center gap-1.5">
                                    <span>{lead.name}</span>
                                    {lead.totalAppointments >= 3 && (
                                      <span title="Cliente VIP">
                                        <Award className="w-3 h-3 text-gold-primary shrink-0" />
                                      </span>
                                    )}
                                  </h5>
                                  <p className="text-[10px] text-white/50 font-mono truncate">{lead.phone}</p>
                                </div>

                                <span className="text-[10px] font-mono font-bold text-gold-primary shrink-0">
                                  {formatPrice(lead.lifetimeValue)}
                                </span>
                              </div>

                              {/* Lead Context: Last Visit or Next Appointment */}
                              {lead.nextAppointment ? (
                                <div className="p-2 bg-emerald-950/20 border border-emerald-500/30 text-[11px] space-y-1">
                                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                                    <Clock className="w-3 h-3" />
                                    <span>
                                      {new Date(lead.nextAppointment.dateTime).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}{' '}
                                      às {new Date(lead.nextAppointment.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-white/70 truncate">{lead.nextAppointment.serviceName}</p>
                                </div>
                              ) : lead.daysSinceLastVisit !== null ? (
                                <div className={`p-2 border text-[11px] space-y-0.5 ${
                                  lead.daysSinceLastVisit >= 15
                                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                                    : 'bg-graphite-light/40 border-graphite-border text-white/70'
                                }`}>
                                  <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-white/40">Último corte:</span>
                                    <span className="font-bold font-mono">há {lead.daysSinceLastVisit} dias</span>
                                  </div>
                                  {lead.lastService && (
                                    <p className="text-[10px] text-white/60 truncate">{lead.lastService}</p>
                                  )}
                                </div>
                              ) : (
                                <div className="text-[10px] text-white/40 italic">Sem cortes registrados ainda</div>
                              )}

                              {/* Quick WhatsApp Action Triggers */}
                              <div className="pt-2 border-t border-graphite-border/70 flex flex-col gap-1.5">
                                {/* If Return is Due: Prominent Gold Button */}
                                {lead.isReturnDue && (
                                  <button
                                    onClick={() => handleSendReturnReminder(lead)}
                                    className="w-full py-1.5 px-2 bg-gold-primary hover:bg-gold-hover text-black font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all"
                                    title="Disparar convite de retorno com cálculo de dias no WhatsApp"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Lembrete de Retorno</span>
                                  </button>
                                )}

                                {/* If Upcoming Soon: Date Notification Button */}
                                {lead.isUpcomingSoon && (
                                  <button
                                    onClick={() => handleSendDateApproachNotification(lead)}
                                    className="w-full py-1.5 px-2 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/40 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                                    title="Notificar cliente sobre a proximidade do corte agendado"
                                  >
                                    <Clock4 className="w-3 h-3" />
                                    <span>Notificar Data do Corte</span>
                                  </button>
                                )}

                                {/* General WhatsApp Direct button */}
                                {!lead.isReturnDue && !lead.isUpcomingSoon && (
                                  <button
                                    onClick={() => handleDirectLeadWhatsApp(lead)}
                                    className="w-full py-1 px-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-graphite-border font-medium text-[10px] flex items-center justify-center gap-1 transition-colors"
                                  >
                                    <MessageSquare className="w-3 h-3 text-emerald-400" />
                                    <span>Conversar via WhatsApp</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* List / Table View of CRM Leads */}
            {crmView === 'list' && (
              <div className="glass-panel border border-gold-primary/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-graphite-border bg-graphite-dark text-[11px] font-bold uppercase tracking-wider text-white/60">
                        <th className="p-4">Cliente / Contato</th>
                        <th className="p-4">Estágio no Funil</th>
                        <th className="p-4">Histórico</th>
                        <th className="p-4">Última Visita</th>
                        <th className="p-4">Próximo Corte</th>
                        <th className="p-4">LTV Total</th>
                        <th className="p-4 text-right">Ação WhatsApp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-graphite-border">
                      {crmLeads
                        .filter((lead) => {
                          const matchesSearch =
                            crmSearch === '' ||
                            lead.name.toLowerCase().includes(crmSearch.toLowerCase()) ||
                            lead.phone.includes(crmSearch);
                          if (!matchesSearch) return false;
                          if (crmFilter === 'RETURN_DUE') return lead.isReturnDue;
                          if (crmFilter === 'UPCOMING') return lead.isUpcomingSoon;
                          if (crmFilter === 'VIP') return lead.totalAppointments >= 3;
                          return true;
                        })
                        .map((lead) => (
                          <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-white text-xs">{lead.name}</div>
                              <div className="text-[11px] text-white/50 font-mono">{lead.phone}</div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                lead.stage === 'RETURN_DUE'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : lead.stage === 'CONFIRMED'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : lead.stage === 'VIP'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : lead.stage === 'COMPLETED'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : 'bg-white/10 text-white/70 border border-white/20'
                              }`}>
                                {lead.stage === 'RETURN_DUE' ? 'Retorno Pendente' :
                                 lead.stage === 'CONFIRMED' ? 'Confirmado' :
                                 lead.stage === 'VIP' ? 'Cliente VIP' :
                                 lead.stage === 'COMPLETED' ? 'Atendido Recente' : 'Novo Lead'}
                              </span>
                            </td>
                            <td className="p-4 text-white/70">
                              <span className="font-bold text-white">{lead.totalAppointments}</span> cortes ({lead.completedAppointments} concluídos)
                            </td>
                            <td className="p-4">
                              {lead.daysSinceLastVisit !== null ? (
                                <div>
                                  <span className={`font-mono font-bold ${lead.daysSinceLastVisit >= 15 ? 'text-amber-400' : 'text-white'}`}>
                                    há {lead.daysSinceLastVisit} dias
                                  </span>
                                  {lead.lastService && <div className="text-[10px] text-white/50">{lead.lastService}</div>}
                                </div>
                              ) : (
                                <span className="text-white/30">—</span>
                              )}
                            </td>
                            <td className="p-4">
                              {lead.nextAppointment ? (
                                <div>
                                  <div className="font-bold text-emerald-400 font-mono">
                                    {new Date(lead.nextAppointment.dateTime).toLocaleDateString('pt-BR')}{' '}
                                    {new Date(lead.nextAppointment.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                  <div className="text-[10px] text-white/60">{lead.nextAppointment.serviceName}</div>
                                </div>
                              ) : (
                                <span className="text-white/30">Nenhum</span>
                              )}
                            </td>
                            <td className="p-4 font-mono font-bold text-gold-primary">
                              {formatPrice(lead.lifetimeValue)}
                            </td>
                            <td className="p-4 text-right">
                              {lead.isReturnDue ? (
                                <button
                                  onClick={() => handleSendReturnReminder(lead)}
                                  className="px-3 py-1.5 bg-gold-primary hover:bg-gold-hover text-black font-bold text-[10px] uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  Lembrete de Retorno
                                </button>
                              ) : lead.isUpcomingSoon ? (
                                <button
                                  onClick={() => handleSendDateApproachNotification(lead)}
                                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/30 font-bold text-[10px] uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                                >
                                  <Clock4 className="w-3 h-3" />
                                  Notificar Data
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleDirectLeadWhatsApp(lead)}
                                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-graphite-border font-medium text-[10px] transition-colors inline-flex items-center gap-1.5"
                                >
                                  <MessageSquare className="w-3 h-3 text-emerald-400" />
                                  WhatsApp
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CENTRAL DE NOTIFICAÇÕES INTELIGENTES */}
        {/* ========================================================================= */}
        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass-panel p-6 border border-gold-primary/10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-graphite-border pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Bell className="w-5 h-5 text-gold-primary" />
                    Central de Notificações e Pendências
                  </h3>
                  <p className="text-xs text-white/40">
                    Acompanhe agendamentos aguardando resposta e clientes que precisam de lembrete no WhatsApp
                  </p>
                </div>
                <span className="text-xs text-gold-primary bg-gold-primary/10 border border-gold-primary/20 px-3 py-1 font-bold">
                  {notificationCount} pendência(s) ativa(s)
                </span>
              </div>

              {notificationCount === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-white font-serif font-bold text-base uppercase tracking-wider">Tudo em dia!</h4>
                  <p className="text-xs text-white/40 max-w-sm mx-auto">
                    Não há agendamentos pendentes de confirmação ou clientes sem lembrete no momento.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 mt-6">
                  {/* Section 1: Agendamentos Pendentes de Confirmação */}
                  {pendingAppointments.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                        <AlertCircle className="w-4 h-4" />
                        <span>Aguardando Confirmação ({pendingAppointments.length})</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendingAppointments.map((app) => (
                          <div
                            key={app.id}
                            className="p-4 bg-graphite-dark/60 border border-amber-500/30 space-y-3 relative"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-bold text-white text-sm">{app.client.name}</h5>
                                <p className="text-xs text-white/50">{app.service.name} • {formatPrice(app.service.price)}</p>
                              </div>
                              <span className="text-xs font-mono font-bold text-gold-primary bg-gold-primary/10 px-2 py-0.5 border border-gold-primary/20">
                                {new Date(app.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-graphite-border/60">
                              <span className="text-[11px] text-white/40">{app.client.phone}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleDirectWhatsApp(app)}
                                  className="px-2.5 py-1 text-xs bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/20 font-semibold transition-colors flex items-center gap-1"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  Chamar WhatsApp
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'CONFIRMED')}
                                  className="px-2.5 py-1 text-xs bg-gold-primary hover:bg-gold-hover text-black font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" />
                                  Aprovar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 2: Lembretes WhatsApp Não Enviados */}
                  {pendingReminders.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-graphite-border/60">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-primary">
                        <MessageCircle className="w-4 h-4" />
                        <span>Lembretes do Dia Pendentes de Envio ({pendingReminders.length})</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendingReminders.map((app) => (
                          <div
                            key={app.id}
                            className="p-4 bg-graphite-dark/60 border border-gold-primary/20 space-y-3"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-bold text-white text-sm">{app.client.name}</h5>
                                <p className="text-xs text-white/50">{app.service.name}</p>
                              </div>
                              <span className="text-xs font-mono font-bold text-white/70">
                                {new Date(app.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-graphite-border/60">
                              <span className="text-[11px] text-white/40">{app.client.phone}</span>
                              <button
                                onClick={() => handleDirectWhatsApp(app)}
                                className="px-3 py-1.5 text-xs bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/40 font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Disparar Lembrete WhatsApp
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: RELATÓRIOS & FATURAMENTO MENSAL */}
        {/* ========================================================================= */}
        {activeTab === 'reports' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Month & Year Filter Bar */}
            <div className="glass-panel p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border border-gold-primary/10">
              <div>
                <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-gold-primary" />
                  Relatório Financeiro & Faturamento
                </h3>
                <p className="text-xs text-white/40">Consolidado de receita, ticket médio e serviços do mês</p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={reportMonth}
                  onChange={(e) => setReportMonth(Number(e.target.value))}
                  className="px-3 py-2 bg-graphite-light border border-graphite-border text-white text-xs font-bold outline-none focus:border-gold-primary cursor-pointer"
                >
                  {monthNames.map((m, idx) => (
                    <option key={m} value={idx + 1}>{m}</option>
                  ))}
                </select>

                <select
                  value={reportYear}
                  onChange={(e) => setReportYear(Number(e.target.value))}
                  className="px-3 py-2 bg-graphite-light border border-graphite-border text-white text-xs font-bold outline-none focus:border-gold-primary cursor-pointer"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>

                <button
                  onClick={() => fetchReport(reportMonth, reportYear)}
                  className="px-3 py-2 bg-gold-primary hover:bg-gold-hover text-black text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Atualizar
                </button>
              </div>
            </div>

            {loadingReport ? (
              <div className="glass-panel p-16 text-center text-white/40 flex items-center justify-center gap-3">
                <RefreshCw className="w-5 h-5 animate-spin text-gold-primary" />
                <span>Calculando relatórios financeiros...</span>
              </div>
            ) : reportData ? (
              <div className="space-y-6">
                {/* 4 Financial KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {/* KPI 1: Faturamento Realizado */}
                  <div className="glass-panel p-6 border border-gold-primary/20 bg-gold-primary/5">
                    <span className="text-[10px] text-gold-primary uppercase tracking-wider font-bold block mb-1">
                      Faturamento Realizado
                    </span>
                    <h3 className="text-3xl font-bold font-serif text-white">
                      {formatPrice(reportData.metrics.realizedRevenue)}
                    </h3>
                    <p className="text-[11px] text-white/40 mt-1.5">
                      {reportData.metrics.completedCount} atendimentos concluídos
                    </p>
                  </div>

                  {/* KPI 2: Faturamento Previsto */}
                  <div className="glass-panel p-6 border border-white/10">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold block mb-1">
                      Faturamento Projetado
                    </span>
                    <h3 className="text-3xl font-bold font-serif text-gold-primary">
                      {formatPrice(reportData.metrics.projectedRevenue)}
                    </h3>
                    <p className="text-[11px] text-white/40 mt-1.5">
                      Inclui cortes confirmados
                    </p>
                  </div>

                  {/* KPI 3: Ticket Médio */}
                  <div className="glass-panel p-6 border border-white/10">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold block mb-1">
                      Ticket Médio
                    </span>
                    <h3 className="text-3xl font-bold font-serif text-white">
                      {formatPrice(reportData.metrics.averageTicket)}
                    </h3>
                    <p className="text-[11px] text-white/40 mt-1.5">
                      Média por cliente atendido
                    </p>
                  </div>

                  {/* KPI 4: Total Agendamentos */}
                  <div className="glass-panel p-6 border border-white/10">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold block mb-1">
                      Total no Mês
                    </span>
                    <h3 className="text-3xl font-bold font-serif text-white">
                      {reportData.metrics.totalAppointments}
                    </h3>
                    <p className="text-[11px] text-rose-400/80 mt-1.5">
                      {reportData.metrics.canceledCount} cancelamento(s)
                    </p>
                  </div>
                </div>

                {/* Daily Revenue Chart (Pure Responsive SVG / Tailwind Bars) */}
                <div className="glass-panel p-6 border border-gold-primary/10 space-y-4">
                  <div className="flex justify-between items-center border-b border-graphite-border pb-3">
                    <h4 className="font-serif text-base font-bold text-white uppercase tracking-wider">
                      Faturamento Diário em {monthNames[reportMonth - 1]} / {reportYear}
                    </h4>
                    <span className="text-xs text-white/40">Valores em R$ (Reais)</span>
                  </div>

                  {/* Bar Chart Visualization */}
                  <div className="pt-6 pb-2">
                    <div className="flex items-end justify-between gap-1 sm:gap-2 h-44 border-b border-graphite-border px-2">
                      {reportData.dailyBreakdown.map((item: any) => {
                        const maxDaily = Math.max(...reportData.dailyBreakdown.map((d: any) => d.revenue), 100);
                        const heightPct = Math.round((item.revenue / maxDaily) * 100);

                        return (
                          <div 
                            key={item.day} 
                            className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
                          >
                            {/* Hover Tooltip */}
                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black border border-gold-primary/40 px-2 py-1 text-[10px] font-mono text-gold-primary whitespace-nowrap z-20 shadow-lg">
                              Dia {item.day}: {formatPrice(item.revenue)} ({item.count} cortes)
                            </div>

                            {/* Bar element */}
                            <div 
                              style={{ height: `${Math.max(heightPct, 4)}%` }}
                              className={`w-full max-w-[14px] sm:max-w-[20px] transition-all duration-300 rounded-t-xs ${
                                item.revenue > 0
                                  ? 'bg-gradient-to-t from-gold-primary/50 to-gold-primary group-hover:brightness-125'
                                  : 'bg-white/5'
                              }`}
                            />
                            <span className="text-[9px] font-mono text-white/40 mt-1">
                              {item.day % 2 === 1 || reportData.dailyBreakdown.length <= 15 ? item.day : ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Service Breakdown Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Breakdown by Service */}
                  <div className="glass-panel p-6 border border-gold-primary/10 space-y-4">
                    <h4 className="font-serif text-base font-bold text-white uppercase tracking-wider border-b border-graphite-border pb-3">
                      Receita por Tipo de Serviço
                    </h4>

                    {reportData.serviceBreakdown.length === 0 ? (
                      <p className="text-xs text-white/40 py-6 text-center">Nenhum serviço faturado neste período.</p>
                    ) : (
                      <div className="space-y-4 pt-2">
                        {reportData.serviceBreakdown.map((service: any) => (
                          <div key={service.name} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-white">{service.name} ({service.count}x)</span>
                              <span className="font-bold text-gold-primary">{formatPrice(service.revenue)}</span>
                            </div>
                            <div className="w-full h-2 bg-graphite-light overflow-hidden rounded-full">
                              <div
                                style={{ width: `${service.percentage}%` }}
                                className="h-full bg-gold-primary transition-all duration-500 rounded-full"
                              />
                            </div>
                            <div className="text-right text-[10px] text-white/40">{service.percentage}% da receita</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Summary of Statuses */}
                  <div className="glass-panel p-6 border border-gold-primary/10 space-y-4">
                    <h4 className="font-serif text-base font-bold text-white uppercase tracking-wider border-b border-graphite-border pb-3">
                      Desempenho dos Atendimentos
                    </h4>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="p-4 bg-graphite-dark/50 border border-emerald-500/20">
                        <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Taxa de Conclusão</span>
                        <div className="text-2xl font-serif font-bold text-emerald-400 mt-1">
                          {reportData.metrics.totalAppointments > 0
                            ? Math.round((reportData.metrics.completedCount / reportData.metrics.totalAppointments) * 100)
                            : 0}%
                        </div>
                        <p className="text-[10px] text-white/40 mt-1">{reportData.metrics.completedCount} finalizados</p>
                      </div>

                      <div className="p-4 bg-graphite-dark/50 border border-rose-500/20">
                        <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Taxa de Cancelamento</span>
                        <div className="text-2xl font-serif font-bold text-rose-400 mt-1">
                          {reportData.metrics.totalAppointments > 0
                            ? Math.round((reportData.metrics.canceledCount / reportData.metrics.totalAppointments) * 100)
                            : 0}%
                        </div>
                        <p className="text-[10px] text-white/40 mt-1">{reportData.metrics.canceledCount} cancelados</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-graphite-border text-xs text-white/60 space-y-2">
                      <div className="flex justify-between">
                        <span>Cortes Confirmados em aberto:</span>
                        <span className="font-bold text-white">{reportData.metrics.confirmedCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Aguardando Confirmação:</span>
                        <span className="font-bold text-amber-400">{reportData.metrics.pendingCount}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ) : null}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ESCALA HORÁRIA APRIMORADA */}
        {/* ========================================================================= */}
        {activeTab === 'availability' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 sm:p-8 max-w-4xl mx-auto border border-gold-primary/10 space-y-6"
          >
            <div className="border-b border-graphite-border pb-4">
              <h3 className="font-serif text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-5 h-5 text-gold-primary" />
                Minha Escala Horária & Disponibilidade
              </h3>
              <p className="text-xs text-white/40 mt-1">
                Configure os dias em que atende, horário de início e fim do expediente e a pausa para almoço.
              </p>
            </div>

            {loadingAvailability ? (
              <div className="py-12 text-center text-white/40 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-gold-primary" />
                <span>Carregando escala de horários...</span>
              </div>
            ) : (
              <form onSubmit={handleSaveAvailability} className="space-y-6 text-sm">
                <div className="space-y-3">
                  {availabilities.map((av, idx) => {
                    return (
                      <div
                        key={av.dayOfWeek}
                        className={`p-4 border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          av.isActive 
                            ? 'bg-graphite-light/40 border-graphite-border' 
                            : 'bg-black/40 border-white/5 opacity-60'
                        }`}
                      >
                        {/* Day Toggle */}
                        <div className="flex items-center gap-3 min-w-[170px]">
                          <input
                            type="checkbox"
                            id={`day-${av.dayOfWeek}`}
                            checked={av.isActive}
                            onChange={(e) => {
                              const updated = [...availabilities];
                              updated[idx].isActive = e.target.checked;
                              setAvailabilities(updated);
                            }}
                            className="w-4 h-4 accent-gold-primary rounded cursor-pointer"
                          />
                          <label 
                            htmlFor={`day-${av.dayOfWeek}`} 
                            className={`font-bold uppercase tracking-wider text-xs cursor-pointer ${
                              av.isActive ? 'text-white' : 'text-white/40'
                            }`}
                          >
                            {dayNames[av.dayOfWeek]}
                          </label>
                        </div>

                        {/* Working Hours & Break */}
                        {av.isActive ? (
                          <div className="flex flex-wrap items-center gap-4 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-white/40 font-light">Expediente:</span>
                              <input
                                type="text"
                                value={av.startTime}
                                onChange={(e) => {
                                  const updated = [...availabilities];
                                  updated[idx].startTime = e.target.value;
                                  setAvailabilities(updated);
                                }}
                                className="w-16 px-2 py-1.5 bg-graphite-light border border-graphite-border focus:border-gold-primary text-white text-center outline-none font-mono"
                                placeholder="09:00"
                              />
                              <span className="text-white/40 font-light">às</span>
                              <input
                                type="text"
                                value={av.endTime}
                                onChange={(e) => {
                                  const updated = [...availabilities];
                                  updated[idx].endTime = e.target.value;
                                  setAvailabilities(updated);
                                }}
                                className="w-16 px-2 py-1.5 bg-graphite-light border border-graphite-border focus:border-gold-primary text-white text-center outline-none font-mono"
                                placeholder="19:00"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-white/40 font-light">Pausa/Almoço:</span>
                              <input
                                type="text"
                                value={av.breakStart || ''}
                                onChange={(e) => {
                                  const updated = [...availabilities];
                                  updated[idx].breakStart = e.target.value || null;
                                  setAvailabilities(updated);
                                }}
                                className="w-16 px-2 py-1.5 bg-graphite-light border border-graphite-border focus:border-gold-primary text-white text-center outline-none font-mono"
                                placeholder="12:00"
                              />
                              <span className="text-white/40 font-light">às</span>
                              <input
                                type="text"
                                value={av.breakEnd || ''}
                                onChange={(e) => {
                                  const updated = [...availabilities];
                                  updated[idx].breakEnd = e.target.value || null;
                                  setAvailabilities(updated);
                                }}
                                className="w-16 px-2 py-1.5 bg-graphite-light border border-graphite-border focus:border-gold-primary text-white text-center outline-none font-mono"
                                placeholder="13:00"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-white/30 italic">Dia de Folga / Barbearia Fechada</div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4 border-t border-graphite-border">
                  <button
                    type="submit"
                    disabled={savingAvailability}
                    className="px-8 py-3.5 bg-gold-primary hover:bg-gold-hover disabled:bg-gold-primary/30 text-black font-bold text-xs tracking-wider uppercase transition-all duration-200"
                  >
                    {savingAvailability ? 'Salvando...' : 'Salvar Disponibilidade'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB: DISPAROS DE WHATSAPP APRIMORADOS */}
        {/* ========================================================================= */}
        {activeTab === 'broadcasts' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 sm:p-8 max-w-4xl mx-auto border border-gold-primary/10 space-y-6"
          >
            <div className="border-b border-graphite-border pb-4">
              <h3 className="font-serif text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gold-primary" />
                Disparos via WhatsApp & Comunicação
              </h3>
              <p className="text-xs text-white/40 mt-1">
                Envie mensagens personalizadas, lembretes de agendamentos e promoções com pré-visualização fidedigna.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Side (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* Recipient Source Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                    Origem do Destinatário
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRecipientType('manual');
                        setSelectedClientId('manual');
                      }}
                      className={`px-3 py-2 text-xs font-bold border transition-colors ${
                        selectedRecipientType === 'manual'
                          ? 'border-gold-primary text-gold-primary bg-gold-primary/10'
                          : 'border-graphite-border text-white/60 hover:text-white'
                      }`}
                    >
                      Digitar Manual
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRecipientType('today');
                      }}
                      className={`px-3 py-2 text-xs font-bold border transition-colors ${
                        selectedRecipientType === 'today'
                          ? 'border-gold-primary text-gold-primary bg-gold-primary/10'
                          : 'border-graphite-border text-white/60 hover:text-white'
                      }`}
                    >
                      Clientes de Hoje
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRecipientType('client');
                      }}
                      className={`px-3 py-2 text-xs font-bold border transition-colors ${
                        selectedRecipientType === 'client'
                          ? 'border-gold-primary text-gold-primary bg-gold-primary/10'
                          : 'border-graphite-border text-white/60 hover:text-white'
                      }`}
                    >
                      Cadastrados
                    </button>
                  </div>
                </div>

                {/* Recipient Selection Dropdown */}
                {selectedRecipientType === 'client' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                      Selecione o Cliente
                    </label>
                    <select
                      value={selectedClientId}
                      onChange={(e) => {
                        const cid = e.target.value;
                        setSelectedClientId(cid);
                        const c = clients.find(item => item.id === cid);
                        if (c) {
                          setManualPhone(c.phone);
                          setManualName(c.name);
                        }
                      }}
                      className="w-full px-4 py-2.5 bg-graphite-light border border-graphite-border focus:border-gold-primary text-white text-xs outline-none"
                    >
                      <option value="manual">Selecione na lista...</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedRecipientType === 'today' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                      Selecione o Agendamento de Hoje
                    </label>
                    <select
                      onChange={(e) => {
                        const app = appointments.find(a => a.id === e.target.value);
                        if (app) {
                          setManualPhone(app.client.phone);
                          setManualName(app.client.name);
                          handleApplyTemplate('reminder', app.client.name);
                        }
                      }}
                      className="w-full px-4 py-2.5 bg-graphite-light border border-graphite-border focus:border-gold-primary text-white text-xs outline-none"
                    >
                      <option value="">Selecione um cliente agendado...</option>
                      {appointments.map(app => (
                        <option key={app.id} value={app.id}>
                          {app.client.name} - {new Date(app.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ({app.service.name})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Name and Phone Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                      Nome do Destinatário
                    </label>
                    <input
                      type="text"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-graphite-light border border-graphite-border focus:border-gold-primary text-white text-xs outline-none"
                      placeholder="Ex: Carlos"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                      Telefone (com DDD)
                    </label>
                    <input
                      type="text"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-graphite-light border border-graphite-border focus:border-gold-primary text-white text-xs outline-none font-mono"
                      placeholder="Ex: 13974249209"
                    />
                  </div>
                </div>

                {/* Template Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                    Template Rápido
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('reminder')}
                      className={`px-3 py-2 text-xs font-semibold border ${
                        selectedTemplate === 'reminder'
                          ? 'border-gold-primary text-gold-primary bg-gold-primary/10'
                          : 'border-graphite-border text-white/60 hover:text-white'
                      }`}
                    >
                      Lembrete
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('confirm')}
                      className={`px-3 py-2 text-xs font-semibold border ${
                        selectedTemplate === 'confirm'
                          ? 'border-gold-primary text-gold-primary bg-gold-primary/10'
                          : 'border-graphite-border text-white/60 hover:text-white'
                      }`}
                    >
                      Confirmado
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('promo')}
                      className={`px-3 py-2 text-xs font-semibold border ${
                        selectedTemplate === 'promo'
                          ? 'border-gold-primary text-gold-primary bg-gold-primary/10'
                          : 'border-graphite-border text-white/60 hover:text-white'
                      }`}
                    >
                      Promoção
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('feedback')}
                      className={`px-3 py-2 text-xs font-semibold border ${
                        selectedTemplate === 'feedback'
                          ? 'border-gold-primary text-gold-primary bg-gold-primary/10'
                          : 'border-graphite-border text-white/60 hover:text-white'
                      }`}
                    >
                      Pós-Corte
                    </button>
                  </div>
                </div>

                {/* Message Box */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                    Texto da Mensagem
                  </label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 bg-graphite-light border border-graphite-border focus:border-gold-primary text-white text-xs outline-none font-sans leading-relaxed"
                    placeholder="Digite a mensagem que deseja enviar..."
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendWhatsAppMessage}
                  disabled={!manualPhone || !customMessage}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-bold text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                >
                  <MessageSquare className="w-4 h-4" />
                  Abrir WhatsApp e Enviar Mensagem
                </button>
              </div>

              {/* Realistic WhatsApp Preview Balloon (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="border border-graphite-border/60 bg-[#0b141a] p-4 rounded-lg flex flex-col h-full justify-between shadow-2xl">
                  {/* WhatsApp Mock Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                    <div className="w-8 h-8 rounded-full bg-gold-primary/20 text-gold-primary flex items-center justify-center font-bold text-xs">
                      {manualName ? manualName.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-bold truncate">{manualName || 'Destinatário'}</h4>
                      <p className="text-[10px] text-white/40">{manualPhone || '+55 13 ...'}</p>
                    </div>
                  </div>

                  {/* Message Bubble Area */}
                  <div className="py-8 px-2 flex flex-col justify-end flex-1">
                    <div className="max-w-[90%] self-end bg-[#005c4b] text-white text-xs p-3 rounded-lg rounded-tr-none shadow relative">
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {customMessage.replace('{Nome}', manualName || 'Carlos') || 'Sua mensagem aparecerá aqui em tempo real...'}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-white/60">
                        <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-[#53bdeb]">✓✓</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer explanation */}
                  <div className="pt-3 border-t border-white/10 text-[10px] text-white/40 text-center">
                    Pré-visualização realista no WhatsApp
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB: CONFIGURAÇÕES DA BARBEARIA (CMS) */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 sm:p-8 max-w-3xl mx-auto border border-gold-primary/10"
          >
            <h3 className="font-serif text-xl font-bold text-white mb-6 uppercase tracking-wider border-b border-graphite-border pb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gold-primary" />
              Configurações do Site (CMS)
            </h3>
            
            <form onSubmit={handleSaveConfig} className="space-y-6 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Brand Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                    Nome da Marca (Hero)
                  </label>
                  <input
                    type="text"
                    required
                    value={heroName}
                    onChange={(e) => setHeroName(e.target.value)}
                    className="w-full px-4 py-3 bg-graphite-light border border-graphite-border focus:border-gold-primary text-white outline-none transition-all duration-300"
                    placeholder="Ex: ALEMÃO 777"
                  />
                </div>

                {/* WhatsApp Number */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                    WhatsApp de Atendimento
                  </label>
                  <input
                    type="text"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-4 py-3 bg-graphite-light border border-graphite-border focus:border-gold-primary text-white outline-none transition-all duration-300"
                    placeholder="Ex: +5513974249209"
                  />
                </div>

                {/* Instagram Link */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                    Link do Instagram
                  </label>
                  <input
                    type="url"
                    required
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full px-4 py-3 bg-graphite-light border border-graphite-border focus:border-gold-primary text-white outline-none transition-all duration-300"
                    placeholder="Ex: https://www.instagram.com/barbeariadoalemao777/"
                  />
                </div>

                {/* Address */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                    Endereço / Localização
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-graphite-light border border-graphite-border focus:border-gold-primary text-white outline-none transition-all duration-300"
                    placeholder="Ex: Rua Espanha, 360 - Jardim Casqueiro - Cubatão / SP"
                  />
                </div>

                {/* Gallery Images URLs */}
                <div className="space-y-1.5 md:col-span-2 border-t border-graphite-border/60 pt-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                    Fotos da Galeria (URLs das Imagens)
                  </label>
                  
                  <div className="space-y-4 mt-2">
                    <div className="flex gap-3 items-center">
                      <span className="text-xs text-white/40 w-16">Foto 1:</span>
                      <input
                        type="text"
                        required
                        value={gallery1}
                        onChange={(e) => setGallery1(e.target.value)}
                        className="w-full px-4 py-2 bg-graphite-light border border-graphite-border focus:border-gold-primary text-white outline-none transition-all duration-300"
                        placeholder="/haircut-fade.png"
                      />
                    </div>
                    
                    <div className="flex gap-3 items-center">
                      <span className="text-xs text-white/40 w-16">Foto 2:</span>
                      <input
                        type="text"
                        required
                        value={gallery2}
                        onChange={(e) => setGallery2(e.target.value)}
                        className="w-full px-4 py-2 bg-graphite-light border border-graphite-border focus:border-gold-primary text-white outline-none transition-all duration-300"
                        placeholder="/haircut-beard.png"
                      />
                    </div>

                    <div className="flex gap-3 items-center">
                      <span className="text-xs text-white/40 w-16">Foto 3:</span>
                      <input
                        type="text"
                        required
                        value={gallery3}
                        onChange={(e) => setGallery3(e.target.value)}
                        className="w-full px-4 py-2 bg-graphite-light border border-graphite-border focus:border-gold-primary text-white outline-none transition-all duration-300"
                        placeholder="/haircut-classic.png"
                      />
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex justify-end pt-4 border-t border-graphite-border">
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-8 py-3.5 bg-gold-primary hover:bg-gold-hover disabled:bg-gold-primary/30 text-black font-bold text-xs tracking-wider uppercase transition-all duration-300"
                >
                  {savingConfig ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        </main>
      </div>

      {/* Modal Simulação de WhatsApp */}
      {simulationResult && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel max-w-md w-full p-6 space-y-6 relative border border-gold-primary/20"
          >
            <button 
              onClick={() => setSimulationResult(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 border-b border-graphite-border pb-4">
              <div className="p-2 bg-gold-primary/10 text-gold-primary">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-white uppercase tracking-wide">Simulação de WhatsApp</h4>
                <p className="text-xs text-white/40 font-light">Destinatário: {simulationResult.phone}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-white/40 font-bold uppercase tracking-wider">Conteúdo da Mensagem</label>
              <div className="bg-black/40 border border-graphite-border p-4 text-sm text-white/85 leading-relaxed font-mono whitespace-pre-wrap">
                {simulationResult.message}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSimulationResult(null)}
                className="px-6 py-2.5 bg-gold-primary hover:bg-gold-hover text-black font-bold text-xs tracking-wider uppercase transition-all duration-300"
              >
                Fechar Simulação
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
