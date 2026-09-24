'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  Bell,
  Users,
  GitBranch,
  Calendar,
  Radio,
  Zap,
  Workflow,
  Bot,
  Settings,
  Sun,
  Moon,
  Crown,
  DollarSign,
  UserPlus,
  Send,
  Briefcase,
  ArrowUp,
  ArrowDown,
  Minus,
  Clock,
  Check,
  X,
  ExternalLink,
  MessageCircle,
  Eye,
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
  RotateCcw,
  Award,
  PhoneCall,
  Menu,
  CheckCircle2,
  Share2,
  Clock4,
  Flame,
  ArrowRight
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

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

type NavTab =
  | 'dashboard'
  | 'inbox'
  | 'notifications'
  | 'contacts'
  | 'pipelines'
  | 'appointments'
  | 'broadcasts'
  | 'automations'
  | 'flows'
  | 'agents'
  | 'settings';

// ============================================================================
// BRAND LOGO (CONCEPT CRM Lobo-Guará)
// ============================================================================

function ConceptLogo({ isDark }: { isDark: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#0624C7] text-white shadow-md shadow-[#0624C7]/20 border border-white/10 shrink-0">
        <svg viewBox="0 0 48 48" fill="none" className="w-6 h-6 shrink-0" aria-label="Lobo-Guará Concept Digital">
          <path
            d="M24 44L14 34L17 25L24 31L31 25L34 34L24 44Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90"
          />
          <path
            d="M24 31V16M24 31L20 23L24 16L28 23L24 31Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 18L11 4L22 13L17 25L14 18Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M34 18L37 4L26 13L31 25L34 18Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M22 13H26" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="19" cy="21" r="1.3" fill="currentColor" opacity="0.8" />
          <circle cx="29" cy="21" r="1.5" fill="#FCE026" />
          <path d="M23 30.5H25" stroke="#FCE026" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-wider text-sm uppercase leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
            CONCEPT
          </span>
          <span className="font-bold text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#0624C7]/15 text-[#0624C7] dark:text-[#5373ff] border border-[#0624C7]/20 leading-none">
            CRM
          </span>
        </div>
        <span className={`text-[10px] tracking-widest uppercase font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          DIGITAL ASSETS
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// CONVERSATIONS CHART (EXACT REPLICA FROM CONCEPT CRM)
// ============================================================================

interface ChartPoint {
  day: string;
  label: string;
  incoming: number;
  outgoing: number;
}

function ConversationsChart({ isDark }: { isDark: boolean }) {
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // Series points matching the screenshot visual curve:
  // Flat at 0 from 26 de ago to ~20 de set, then sharp rise up to 10 incoming and 7 outgoing
  const data: ChartPoint[] = useMemo(() => {
    if (range === 7) {
      return [
        { day: '18/09', label: '18 de set.', incoming: 0, outgoing: 0 },
        { day: '19/09', label: '19 de set.', incoming: 0, outgoing: 0 },
        { day: '20/09', label: '20 de set.', incoming: 0, outgoing: 0 },
        { day: '21/09', label: '21 de set.', incoming: 2, outgoing: 1 },
        { day: '22/09', label: '22 de set.', incoming: 5, outgoing: 3 },
        { day: '23/09', label: '23 de set.', incoming: 8, outgoing: 6 },
        { day: '24/09', label: 'Hoje', label_short: 'Hoje', incoming: 10, outgoing: 7 },
      ] as any;
    }
    if (range === 90) {
      return [
        { day: '01/07', label: '1 de jul.', incoming: 0, outgoing: 0 },
        { day: '15/07', label: '15 de jul.', incoming: 0, outgoing: 0 },
        { day: '01/08', label: '1 de ago.', incoming: 0, outgoing: 0 },
        { day: '15/08', label: '15 de ago.', incoming: 0, outgoing: 0 },
        { day: '01/09', label: '1 de set.', incoming: 0, outgoing: 0 },
        { day: '15/09', label: '15 de set.', incoming: 2, outgoing: 1 },
        { day: '24/09', label: '24 de set.', incoming: 10, outgoing: 7 },
      ];
    }
    // 30 days (default)
    return [
      { day: '26/08', label: '26 de ago.', incoming: 0, outgoing: 0 },
      { day: '28/08', label: '28 de ago.', incoming: 0, outgoing: 0 },
      { day: '31/08', label: '31 de ago.', incoming: 0, outgoing: 0 },
      { day: '03/09', label: '3 de set.', incoming: 0, outgoing: 0 },
      { day: '05/09', label: '5 de set.', incoming: 0, outgoing: 0 },
      { day: '08/09', label: '8 de set.', incoming: 0, outgoing: 0 },
      { day: '10/09', label: '10 de set.', incoming: 0, outgoing: 0 },
      { day: '13/09', label: '13 de set.', incoming: 0, outgoing: 0 },
      { day: '15/09', label: '15 de set.', incoming: 0, outgoing: 0 },
      { day: '18/09', label: '18 de set.', incoming: 0, outgoing: 0 },
      { day: '20/09', label: '20 de set.', incoming: 0, outgoing: 0 },
      { day: '22/09', label: '22 de set.', incoming: 3, outgoing: 2 },
      { day: '23/09', label: '23 de set.', incoming: 7, outgoing: 5 },
      { day: '24/09', label: 'Hoje', incoming: 10, outgoing: 7 },
    ];
  }, [range]);

  const VB_W = 760;
  const VB_H = 240;
  const PADDING = { top: 16, right: 20, bottom: 32, left: 36 };
  const chartW = VB_W - PADDING.left - PADDING.right;
  const chartH = VB_H - PADDING.top - PADDING.bottom;
  const maxY = 10;
  const ticks = [0, 3, 5, 8, 10];

  const stepX = chartW / (data.length - 1);
  const xFor = (i: number) => PADDING.left + i * stepX;
  const yFor = (v: number) => PADDING.top + chartH - (v / maxY) * chartH;

  const incomingPath = data.map((p, i) => `${i === 0 ? 'M' : 'L'}${xFor(i)},${yFor(p.incoming)}`).join(' ');
  const outgoingPath = data.map((p, i) => `${i === 0 ? 'M' : 'L'}${xFor(i)},${yFor(p.outgoing)}`).join(' ');

  // Display ~6 labels evenly spaced along the x axis
  const stride = Math.max(1, Math.floor(data.length / 5));

  return (
    <section className={`flex h-full flex-col rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
      <header className={`flex items-center justify-between border-b px-5 py-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <div>
          <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Conversas ao longo do tempo
          </h2>
          <p className={`mt-0.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Volume diário de mensagens por direção
          </p>
        </div>
        <div className={`flex items-center gap-1 rounded-lg p-1 ${isDark ? 'bg-slate-800/70' : 'bg-slate-100'}`}>
          {([7, 30, 90] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                range === r
                  ? isDark
                    ? 'bg-slate-700 text-white font-semibold shadow-xs'
                    : 'bg-white text-slate-900 font-semibold shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {r} dias
            </button>
          ))}
        </div>
      </header>

      <div className="relative p-5">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="h-[240px] w-full overflow-visible"
          role="img"
          aria-label="Gráfico de conversas ao longo do tempo"
        >
          {/* Y gridlines and ticks */}
          {ticks.map((t) => {
            const y = yFor(t);
            return (
              <g key={t}>
                <line
                  x1={PADDING.left}
                  x2={VB_W - PADDING.right}
                  y1={y}
                  y2={y}
                  stroke={isDark ? '#334155' : '#E2E8F0'}
                  strokeDasharray="3 3"
                />
                <text
                  x={PADDING.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className={`text-[10px] font-mono ${isDark ? 'fill-slate-400' : 'fill-slate-400'}`}
                >
                  {t}
                </text>
              </g>
            );
          })}

          {/* X axis labels */}
          {data.map((p, i) =>
            i % stride === 0 || i === data.length - 1 ? (
              <text
                key={p.day}
                x={xFor(i)}
                y={VB_H - 8}
                textAnchor="middle"
                className={`text-[10px] ${isDark ? 'fill-slate-400' : 'fill-slate-500'}`}
              >
                {p.label}
              </text>
            ) : null
          )}

          {/* Outgoing polyline (Purple / Violet) */}
          <path
            d={outgoingPath}
            fill="none"
            stroke="#9333EA"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Incoming polyline (Concept Blue) */}
          <path
            d={incomingPath}
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hit targets for hover */}
          {data.map((p, i) => (
            <circle
              key={p.day}
              cx={xFor(i)}
              cy={yFor(p.incoming)}
              r={hoverIdx === i ? 5 : 3}
              fill="#2563EB"
              className="cursor-pointer transition-all hover:r-6"
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            />
          ))}
        </svg>

        {hoverIdx !== null && data[hoverIdx] && (
          <div
            className={`absolute top-8 z-10 -translate-x-1/2 rounded-lg border px-3 py-2 text-xs shadow-lg backdrop-blur-md pointer-events-none transition-all ${
              isDark ? 'bg-slate-900/95 border-slate-700 text-white' : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200'
            }`}
            style={{ left: `${(xFor(hoverIdx) / VB_W) * 100}%` }}
          >
            <p className="font-semibold">{data[hoverIdx].label}</p>
            <div className="mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-blue-500">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Recebidas: {data[hoverIdx].incoming}
              </span>
              <span className="flex items-center gap-1.5 text-purple-500">
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                Enviadas: {data[hoverIdx].outgoing}
              </span>
            </div>
          </div>
        )}
      </div>

      <footer className={`flex items-center gap-5 border-t px-5 py-3 text-xs ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          <span>Recebidas</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-600" />
          <span>Enviadas</span>
        </div>
      </footer>
    </section>
  );
}

// ============================================================================
// MAIN COMPONENT: ADMIN DASHBOARD
// ============================================================================

export default function AdminDashboard({ initialAppointments, tenant, views }: AdminDashboardProps) {
  // Theme state: defaults to light to exactly match Image 2
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const isDark = theme === 'dark';

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
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

  // Appointments Filter and Search
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');

  // CRM & Leads State
  const [crmLeads, setCrmLeads] = useState<CRMLead[]>([]);
  const [crmMetrics, setCrmMetrics] = useState({
    totalLeads: 0,
    returnDueCount: 0,
    upcomingSoonCount: 0,
    vipCount: 0,
    totalPipelineValue: 0,
    openDealsCount: 0,
  });
  const [loadingCRM, setLoadingCRM] = useState(false);
  const [crmFilter, setCrmFilter] = useState<'ALL' | 'RETURN_DUE' | 'UPCOMING' | 'VIP' | 'NEW'>('ALL');
  const [crmSearch, setCrmSearch] = useState('');
  const [crmView, setCrmView] = useState<'kanban' | 'list'>('kanban');

  // WhatsApp & Broadcast State
  const [clients, setClients] = useState<any[]>([]);
  const [selectedRecipientType, setSelectedRecipientType] = useState<'manual' | 'today' | 'tomorrow' | 'return_due' | 'all'>('manual');
  const [manualPhone, setManualPhone] = useState<string>('');
  const [manualName, setManualName] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('reminder');
  const [customMessage, setCustomMessage] = useState<string>(
    'Olá {Nome}! Passando para lembrar do seu corte na Barbearia do Alemão 777. Nos vemos em breve!'
  );

  // Quick Action Modals
  const [newContactModal, setNewContactModal] = useState(false);
  const [newContactData, setNewContactData] = useState({ name: '', phone: '', email: '', notes: '' });

  // CMS Form State
  const themeConfig = tenant?.themeConfig || {};
  const [heroName, setHeroName] = useState(themeConfig.heroName || 'ALEMÃO 777');
  const [instagram, setInstagram] = useState(themeConfig.instagram || 'https://www.instagram.com/barbeariadoalemao777/');
  const [whatsapp, setWhatsapp] = useState(themeConfig.whatsapp || '+5513974249209');
  const [address, setAddress] = useState(themeConfig.address || 'Rua Espanha, 360 - Jardim Casqueiro - Cubatão / SP');
  const [savingConfig, setSavingConfig] = useState(false);

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

  // Fetch CRM Leads
  const fetchCRMLeads = useCallback(async () => {
    setLoadingCRM(true);
    try {
      const res = await fetch('/api/admin/crm/leads');
      if (res.ok) {
        const data = await res.json();
        setCrmLeads(data.leads || []);
        if (data.metrics) {
          setCrmMetrics({
            ...data.metrics,
            openDealsCount: data.leads ? data.leads.filter((l: any) => l.stage === 'CONFIRMED' || l.stage === 'NEW_LEAD').length : 0,
          });
        }
      }
    } catch (err) {
      console.error('Error fetching CRM leads:', err);
    } finally {
      setLoadingCRM(false);
    }
  }, []);

  // Auto-refresh every 30s
  useEffect(() => {
    fetchAppointments(selectedDate);
    fetchCRMLeads();

    if (!autoRefreshEnabled) return;
    const interval = setInterval(() => {
      fetchAppointments(selectedDate);
      fetchCRMLeads();
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedDate, autoRefreshEnabled, fetchAppointments, fetchCRMLeads]);

  // Handle appointment status update
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
        );
        fetchCRMLeads();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Direct WhatsApp sender
  const handleSendWhatsApp = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Filtered appointments
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

  // Save CMS Settings
  const handleSaveCMS = async (e: React.FormEvent) => {
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
        }),
      });
      if (res.ok) {
        alert('Configurações salvas com sucesso!');
      } else {
        alert('Erro ao salvar configurações.');
      }
    } catch (err) {
      console.error('Error saving CMS:', err);
      alert('Erro de conexão ao salvar.');
    } finally {
      setSavingConfig(false);
    }
  };

  // Notification count
  const pendingAppointments = useMemo(
    () => appointments.filter((a) => a.status === 'PENDING_CONFIRMATION'),
    [appointments]
  );
  const notificationCount = pendingAppointments.length + crmMetrics.returnDueCount;

  // Title for top header
  const getTabTitle = (tab: NavTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Painel';
      case 'inbox':
        return 'Caixa de entrada';
      case 'notifications':
        return 'Notificações';
      case 'contacts':
        return 'Contatos';
      case 'pipelines':
        return 'Pipelines';
      case 'appointments':
        return 'Agendamentos';
      case 'broadcasts':
        return 'Disparos';
      case 'automations':
        return 'Automações';
      case 'flows':
        return 'Fluxos';
      case 'agents':
        return 'Agentes de IA';
      case 'settings':
        return 'Configurações';
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-200 ${isDark ? 'bg-[#0B0F17] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
      
      {/* ========================================================================= */}
      {/* MOBILE BACKDROP */}
      {/* ========================================================================= */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* ========================================================================= */}
      {/* FIXED LEFT SIDEBAR (EXACT REPLICA FROM CONCEPT CRM) */}
      {/* ========================================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r transition-transform duration-200 ease-out will-change-transform lg:static lg:z-0 lg:w-64 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isDark ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200'}`}
      >
        {/* Brand / Logo Top Row */}
        <div className={`flex h-14 shrink-0 items-center justify-between border-b px-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <ConceptLogo isDark={isDark} />
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className={`p-1.5 rounded-md lg:hidden ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {/* 1. Painel */}
          <button
            type="button"
            onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#0624C7] text-white shadow-sm font-semibold'
                : isDark
                ? 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="flex-1 text-left">Painel</span>
          </button>

          {/* 2. Caixa de entrada */}
          <button
            type="button"
            onClick={() => { setActiveTab('inbox'); setSidebarOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              activeTab === 'inbox'
                ? 'bg-[#0624C7] text-white shadow-sm font-semibold'
                : isDark
                ? 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="flex-1 text-left">Caixa de entrada</span>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
            </span>
          </button>

          {/* 3. Notificações */}
          <button
            type="button"
            onClick={() => { setActiveTab('notifications'); setSidebarOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              activeTab === 'notifications'
                ? 'bg-[#0624C7] text-white shadow-sm font-semibold'
                : isDark
                ? 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Bell className="h-4 w-4" />
            <span className="flex-1 text-left">Notificações</span>
            {notificationCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                {notificationCount}
              </span>
            )}
          </button>

          {/* 4. Contatos */}
          <button
            type="button"
            onClick={() => { setActiveTab('contacts'); setSidebarOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              activeTab === 'contacts'
                ? 'bg-[#0624C7] text-white shadow-sm font-semibold'
                : isDark
                ? 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="h-4 w-4" />
            <span className="flex-1 text-left">Contatos</span>
          </button>

          {/* 5. Pipelines */}
          <button
            type="button"
            onClick={() => { setActiveTab('pipelines'); setSidebarOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              activeTab === 'pipelines'
                ? 'bg-[#0624C7] text-white shadow-sm font-semibold'
                : isDark
                ? 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <GitBranch className="h-4 w-4" />
            <span className="flex-1 text-left">Pipelines</span>
          </button>

          {/* 6. Agendamentos */}
          <button
            type="button"
            onClick={() => { setActiveTab('appointments'); setSidebarOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              activeTab === 'appointments'
                ? 'bg-[#0624C7] text-white shadow-sm font-semibold'
                : isDark
                ? 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span className="flex-1 text-left">Agendamentos</span>
            {appointments.length > 0 && (
              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                {appointments.length}
              </span>
            )}
          </button>

          {/* 7. Disparos */}
          <button
            type="button"
            onClick={() => { setActiveTab('broadcasts'); setSidebarOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              activeTab === 'broadcasts'
                ? 'bg-[#0624C7] text-white shadow-sm font-semibold'
                : isDark
                ? 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Radio className="h-4 w-4" />
            <span className="flex-1 text-left">Disparos</span>
          </button>

          {/* 8. Automações */}
          <button
            type="button"
            onClick={() => { setActiveTab('automations'); setSidebarOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              activeTab === 'automations'
                ? 'bg-[#0624C7] text-white shadow-sm font-semibold'
                : isDark
                ? 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Zap className="h-4 w-4" />
            <span className="flex-1 text-left">Automações</span>
          </button>

          {/* 9. Fluxos (BETA) */}
          <button
            type="button"
            onClick={() => { setActiveTab('flows'); setSidebarOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              activeTab === 'flows'
                ? 'bg-[#0624C7] text-white shadow-sm font-semibold'
                : isDark
                ? 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Workflow className="h-4 w-4" />
            <span className="flex-1 text-left">Fluxos</span>
            <span className="rounded-full border border-[#FCE026]/40 bg-[#FCE026]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#b89f0a] dark:text-[#FCE026]">
              BETA
            </span>
          </button>

          {/* 10. Agentes de IA */}
          <button
            type="button"
            onClick={() => { setActiveTab('agents'); setSidebarOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              activeTab === 'agents'
                ? 'bg-[#0624C7] text-white shadow-sm font-semibold'
                : isDark
                ? 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Bot className="h-4 w-4" />
            <span className="flex-1 text-left">Agentes de IA</span>
          </button>

          {/* Divider */}
          <div className={`my-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />

          {/* 11. Configurações */}
          <button
            type="button"
            onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-[#0624C7] text-white shadow-sm font-semibold'
                : isDark
                ? 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span className="flex-1 text-left">Configurações</span>
          </button>
        </nav>

        {/* Bottom User Section (Matching Image 2) */}
        <div className={`shrink-0 border-t p-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          {/* Account name & Crown badge */}
          <div className="mb-2 flex items-center justify-between px-2 text-xs">
            <div className="flex items-center gap-1.5 font-medium truncate">
              <span className={`truncate max-w-[100px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                saccon...
              </span>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#FCE026]/40 bg-[#FCE026]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#b89f0a] dark:text-[#FCE026]">
              <Crown className="w-3 h-3 text-[#FCE026]" />
              PROPRIETÁRIO
            </span>
          </div>

          {/* User Email Pill */}
          <div className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors ${isDark ? 'hover:bg-slate-800/70' : 'hover:bg-slate-100'}`}>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 font-bold text-xs shrink-0">
              S
            </div>
            <p className={`truncate text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`} title="sacconceptdigital@gmail.com">
              sacconceptdigital@gma...
            </p>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT */}
      {/* ========================================================================= */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Top Header Bar */}
        <header className={`flex h-14 shrink-0 items-center justify-between border-b px-4 lg:px-6 transition-colors ${isDark ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className={`p-2 rounded-md lg:hidden ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
              aria-label="Abrir Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className={`text-base font-semibold sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {getTabTitle(activeTab)}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
              isDark ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Ao Vivo</span>
            </div>

            {/* Theme Toggle (Sun / Moon) */}
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-2 rounded-lg border transition-all ${
                isDark 
                  ? 'border-slate-700 bg-slate-800 text-amber-400 hover:bg-slate-700' 
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Profile Avatar */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/15 text-blue-600 font-bold text-sm border border-blue-600/20">
              S
            </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* ========================================================================= */}
          {/* VIEW 1: PAINEL (EXACT REPLICA FROM CONCEPT CRM IMAGE 2) */}
          {/* ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Header */}
              <div>
                <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Painel
                </h1>
                <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Métricas ao vivo de conversas, contatos, negócios, disparos e automações.
                </p>
              </div>

              {/* 5 KPI Metric Cards in a single row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* 1. Conversas ativas */}
                <div className={`rounded-xl border p-5 transition-all ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                  <div className="flex items-start justify-between">
                    <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Conversas ativas
                    </p>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                      <MessageSquare className="h-4 w-4" />
                    </div>
                  </div>
                  <p className={`mt-3 text-[28px] font-bold leading-none tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    3
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                    <ArrowUp className="h-3.5 w-3.5" />
                    <span>+1 novos hoje vs. ontem</span>
                  </div>
                </div>

                {/* 2. Novos contatos hoje */}
                <div className={`rounded-xl border p-5 transition-all ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                  <div className="flex items-start justify-between">
                    <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Novos contatos hoje
                    </p>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                      <UserPlus className="h-4 w-4" />
                    </div>
                  </div>
                  <p className={`mt-3 text-[28px] font-bold leading-none tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    2
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                    <ArrowUp className="h-3.5 w-3.5" />
                    <span>+1 vs. ontem</span>
                  </div>
                </div>

                {/* 3. Valor dos negócios abertos */}
                <div className={`rounded-xl border p-5 transition-all ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                  <div className="flex items-start justify-between">
                    <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Valor dos negócios abertos
                    </p>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                      <DollarSign className="h-4 w-4" />
                    </div>
                  </div>
                  <p className={`mt-3 text-[28px] font-bold leading-none tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    R$ 0
                  </p>
                  <p className={`mt-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    0 negócios abertos
                  </p>
                </div>

                {/* 4. Mensagens enviadas hoje */}
                <div className={`rounded-xl border p-5 transition-all ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                  <div className="flex items-start justify-between">
                    <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Mensagens enviadas hoje
                    </p>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                      <Send className="h-4 w-4" />
                    </div>
                  </div>
                  <p className={`mt-3 text-[28px] font-bold leading-none tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    0
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-xs font-medium text-rose-500">
                    <ArrowDown className="h-3.5 w-3.5" />
                    <span>-1 vs. ontem</span>
                  </div>
                </div>

                {/* 5. Reuniões Agendadas */}
                <div className={`rounded-xl border p-5 transition-all ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                  <div className="flex items-start justify-between">
                    <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Reuniões Agendadas
                    </p>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                      <Calendar className="h-4 w-4" />
                    </div>
                  </div>
                  <p className={`mt-3 text-[28px] font-bold leading-none tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {appointments.length}
                  </p>
                  <p className={`mt-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    ativas nesta semana
                  </p>
                </div>
              </div>

              {/* 5 Quick Action Pill Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* 1. Novo contato */}
                <button
                  type="button"
                  onClick={() => setNewContactModal(true)}
                  className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all hover:shadow-xs ${
                    isDark
                      ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                    Novo contato
                  </span>
                </button>

                {/* 2. Novo negócio */}
                <button
                  type="button"
                  onClick={() => setActiveTab('pipelines')}
                  className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all hover:shadow-xs ${
                    isDark
                      ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                    Novo negócio
                  </span>
                </button>

                {/* 3. Novo agendamento */}
                <button
                  type="button"
                  onClick={() => setActiveTab('appointments')}
                  className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all hover:shadow-xs ${
                    isDark
                      ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                    Novo agendamento
                  </span>
                </button>

                {/* 4. Novo disparo */}
                <button
                  type="button"
                  onClick={() => setActiveTab('broadcasts')}
                  className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all hover:shadow-xs ${
                    isDark
                      ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 shrink-0">
                    <Radio className="h-4 w-4" />
                  </div>
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                    Novo disparo
                  </span>
                </button>

                {/* 5. Nova automação */}
                <button
                  type="button"
                  onClick={() => setActiveTab('automations')}
                  className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all hover:shadow-xs ${
                    isDark
                      ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                    <Zap className="h-4 w-4" />
                  </div>
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                    Nova automação
                  </span>
                </button>
              </div>

              {/* 2-Column Section (Conversas ao longo do tempo + Valor do pipeline) */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                
                {/* Left (3 cols): Conversas ao longo do tempo */}
                <div className="h-full lg:col-span-3">
                  <ConversationsChart isDark={isDark} />
                </div>

                {/* Right (2 cols): Valor do pipeline */}
                <div className="h-full lg:col-span-2">
                  <section className={`flex h-full flex-col rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                    <header className={`border-b px-5 py-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                      <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Valor do pipeline
                      </h2>
                      <p className={`mt-0.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Negócios abertos por etapa
                      </p>
                    </header>

                    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center min-h-[280px]">
                      {crmMetrics.totalPipelineValue > 0 ? (
                        <div className="w-full space-y-4">
                          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {formatPrice(crmMetrics.totalPipelineValue)}
                          </div>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {crmLeads.length} leads monitorados no funil
                          </p>
                          <div className="space-y-2 text-left pt-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Agendados Ativos:</span>
                              <span className="font-semibold">{crmLeads.filter(l => l.stage === 'CONFIRMED').length}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Retorno Pendente:</span>
                              <span className="font-semibold text-amber-500">{crmMetrics.returnDueCount}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Clientes VIP:</span>
                              <span className="font-semibold text-purple-500">{crmMetrics.vipCount}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full rounded-xl border border-dashed p-8 flex flex-col items-center justify-center h-full">
                          <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full border ${isDark ? 'bg-slate-800/80 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                            <GitBranch className="h-6 w-6" />
                          </div>
                          <p className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            Nenhum negócio aberto ainda
                          </p>
                          <p className={`mt-1 max-w-[260px] text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Crie negócios em Pipelines para ver a divisão por etapa aqui.
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: AGENDAMENTOS (Barber Management System) */}
          {/* ========================================================================= */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              
              {/* Header + Date Controls */}
              <div className={`rounded-xl border p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs uppercase tracking-wider font-bold mr-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Data:
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => { setSelectedDate(getTodayStr()); fetchAppointments(getTodayStr()); }}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      selectedDate === getTodayStr()
                        ? 'bg-[#0624C7] text-white shadow-xs'
                        : isDark
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Hoje
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      const y = tomorrow.getFullYear();
                      const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
                      const d = String(tomorrow.getDate()).padStart(2, '0');
                      const dt = `${y}-${m}-${d}`;
                      setSelectedDate(dt);
                      fetchAppointments(dt);
                    }}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      selectedDate !== getTodayStr()
                        ? 'bg-[#0624C7] text-white shadow-xs'
                        : isDark
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Amanhã
                  </button>

                  <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                    <CalendarDays className="w-4 h-4 text-blue-600" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        if (e.target.value) {
                          setSelectedDate(e.target.value);
                          fetchAppointments(e.target.value);
                        }
                      }}
                      className="bg-transparent outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* View switcher */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Visualização:</span>
                  <div className={`flex rounded-lg p-1 border ${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                    <button
                      type="button"
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        viewMode === 'table'
                          ? isDark ? 'bg-slate-700 text-white shadow-xs' : 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Tabela
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('timeline')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        viewMode === 'timeline'
                          ? isDark ? 'bg-slate-700 text-white shadow-xs' : 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Linha do Tempo
                    </button>
                  </div>
                </div>
              </div>

              {/* Day Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`rounded-xl border p-5 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                  <span className={`text-xs uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Faturamento (Dia)
                  </span>
                  <h3 className="text-2xl font-bold text-blue-600 mt-1">
                    {formatPrice(
                      appointments
                        .filter((a) => a.status === 'CONFIRMED' || a.status === 'COMPLETED')
                        .reduce((acc, a) => acc + a.service.price, 0)
                    )}
                  </h3>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {appointments.filter((a) => a.status === 'COMPLETED').length} atendimento(s) concluído(s)
                  </p>
                </div>

                <div className={`rounded-xl border p-5 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                  <span className={`text-xs uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Ocupação da Grade
                  </span>
                  <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {appointments.length > 0 ? Math.min(Math.round((appointments.length / 18) * 100), 100) : 0}%
                  </h3>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {appointments.length} de 18 horários ocupados
                  </p>
                </div>

                <div className={`rounded-xl border p-5 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                  <span className={`text-xs uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Agendamentos
                  </span>
                  <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {appointments.length}
                  </h3>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Data: {selectedDate.split('-').reverse().join('/')}
                  </p>
                </div>

                <div className={`rounded-xl border p-5 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                  <span className={`text-xs uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Visitas no Site
                  </span>
                  <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                    {views}
                  </h3>
                  <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Página Ativa
                  </p>
                </div>
              </div>

              {/* Filters & Search */}
              <div className={`rounded-xl border p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar cliente, serviço..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full rounded-lg border py-2 pl-9 pr-4 text-xs outline-none transition-all ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(['ALL', 'CONFIRMED', 'PENDING_CONFIRMATION', 'COMPLETED', 'CANCELED'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        statusFilter === st
                          ? 'bg-[#0624C7] text-white'
                          : isDark
                          ? 'bg-slate-800 text-slate-400 hover:text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'ALL'
                        ? 'Todos'
                        : st === 'CONFIRMED'
                        ? 'Confirmados'
                        : st === 'PENDING_CONFIRMATION'
                        ? 'Pendentes'
                        : st === 'COMPLETED'
                        ? 'Concluídos'
                        : 'Cancelados'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Appointments List / Table */}
              <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                {filteredAppointments.length === 0 ? (
                  <div className="p-12 text-center">
                    <Calendar className="w-12 h-12 mx-auto text-slate-400 mb-3 opacity-50" />
                    <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Nenhum agendamento encontrado para esta data ou filtro selecionado.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredAppointments.map((app) => (
                      <div key={app.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold shrink-0">
                            <Clock className="w-4 h-4 mb-0.5" />
                            <span className="text-xs">
                              {new Date(app.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {app.client.name}
                              </h4>
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                                app.status === 'CONFIRMED'
                                  ? 'bg-blue-500/10 text-blue-600'
                                  : app.status === 'COMPLETED'
                                  ? 'bg-emerald-500/10 text-emerald-600'
                                  : app.status === 'CANCELED'
                                  ? 'bg-rose-500/10 text-rose-600'
                                  : 'bg-amber-500/10 text-amber-600'
                              }`}>
                                {app.status === 'CONFIRMED' ? 'Confirmado' : app.status === 'COMPLETED' ? 'Concluído' : app.status === 'CANCELED' ? 'Cancelado' : 'Pendente'}
                              </span>
                            </div>

                            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {app.service.name} • {app.barber.name} • <span className="font-semibold text-blue-600 dark:text-blue-400">{formatPrice(app.service.price)}</span>
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Tel: {app.client.phone}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() =>
                              handleSendWhatsApp(
                                app.client.phone,
                                `Olá ${app.client.name}! Confirmando seu agendamento de ${app.service.name} hoje às ${new Date(app.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} na Barbearia do Alemão 777.`
                              )
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            WhatsApp
                          </button>

                          {app.status !== 'CONFIRMED' && app.status !== 'COMPLETED' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(app.id, 'CONFIRMED')}
                              className="px-3 py-1.5 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-colors"
                            >
                              Confirmar
                            </button>
                          )}

                          {app.status !== 'COMPLETED' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(app.id, 'COMPLETED')}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                            >
                              Concluir
                            </button>
                          )}

                          {app.status !== 'CANCELED' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(app.id, 'CANCELED')}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                              title="Cancelar agendamento"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 3: PIPELINES (5-Stage CRM Kanban Board) */}
          {/* ========================================================================= */}
          {activeTab === 'pipelines' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Pipeline de Leads & Clientes
                  </h2>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Monitore o ciclo de vida dos seus clientes, retornos e oportunidades de re-agendamento.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchCRMLeads}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingCRM ? 'animate-spin' : ''}`} />
                  Atualizar Funil
                </button>
              </div>

              {/* Kanban Grid */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
                {/* Stage 1: Novos Leads */}
                <div className={`rounded-xl border p-4 flex flex-col min-h-[450px] ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Novos Leads
                    </span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                      {crmLeads.filter((l) => l.stage === 'NEW_LEAD').length}
                    </span>
                  </div>
                  <div className="mt-3 flex-1 space-y-3">
                    {crmLeads
                      .filter((l) => l.stage === 'NEW_LEAD')
                      .map((lead) => (
                        <div key={lead.id} className={`rounded-lg border p-3 ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                          <p className="font-semibold text-xs">{lead.name}</p>
                          <p className="text-[11px] text-slate-500 mt-1">{lead.phone}</p>
                          <button
                            type="button"
                            onClick={() => handleSendWhatsApp(lead.phone, `Olá ${lead.name}! Gostaria de agendar seu horário na Barbearia do Alemão?`)}
                            className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1 text-[11px] font-semibold bg-emerald-600 text-white rounded hover:bg-emerald-700"
                          >
                            <MessageSquare className="w-3 h-3" /> WhatsApp
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Stage 2: Agendado */}
                <div className={`rounded-xl border p-4 flex flex-col min-h-[450px] ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-500">
                      Agendado
                    </span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-bold">
                      {crmLeads.filter((l) => l.stage === 'CONFIRMED').length}
                    </span>
                  </div>
                  <div className="mt-3 flex-1 space-y-3">
                    {crmLeads
                      .filter((l) => l.stage === 'CONFIRMED')
                      .map((lead) => (
                        <div key={lead.id} className={`rounded-lg border p-3 border-l-4 border-l-blue-500 ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                          <p className="font-semibold text-xs">{lead.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{lead.nextAppointment?.serviceName}</p>
                          <p className="text-[11px] text-blue-600 font-bold mt-1">
                            {lead.nextAppointment?.dateTime ? new Date(lead.nextAppointment.dateTime).toLocaleDateString('pt-BR') : ''}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Stage 3: Concluído */}
                <div className={`rounded-xl border p-4 flex flex-col min-h-[450px] ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                      Atendimento OK
                    </span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                      {crmLeads.filter((l) => l.stage === 'COMPLETED').length}
                    </span>
                  </div>
                  <div className="mt-3 flex-1 space-y-3">
                    {crmLeads
                      .filter((l) => l.stage === 'COMPLETED')
                      .map((lead) => (
                        <div key={lead.id} className={`rounded-lg border p-3 ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                          <p className="font-semibold text-xs">{lead.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">LTV: {formatPrice(lead.lifetimeValue)}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{lead.totalAppointments} visita(s)</p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Stage 4: Retorno (15-30 dias) - CRITICAL FOR RECURRENCE */}
                <div className={`rounded-xl border p-4 flex flex-col min-h-[450px] border-amber-400/40 bg-amber-50/20 dark:bg-amber-950/10`}>
                  <div className="flex items-center justify-between pb-3 border-b border-amber-200/50 dark:border-amber-800/50">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      Retorno (15-30d)
                    </span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 font-bold text-[10px]">
                      {crmLeads.filter((l) => l.stage === 'RETURN_DUE').length}
                    </span>
                  </div>
                  <div className="mt-3 flex-1 space-y-3">
                    {crmLeads
                      .filter((l) => l.stage === 'RETURN_DUE')
                      .map((lead) => (
                        <div key={lead.id} className="rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 p-3 shadow-xs">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-xs">{lead.name}</p>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 font-semibold">
                              {lead.daysSinceLastVisit} dias
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">Último: {lead.lastService || 'Corte'}</p>
                          <button
                            type="button"
                            onClick={() =>
                              handleSendWhatsApp(
                                lead.phone,
                                `Fala ${lead.name}! Já faz ${lead.daysSinceLastVisit || 20} dias desde seu último corte. Bora alinhar o visual essa semana? Reservo seu horário agora!`
                              )
                            }
                            className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors shadow-xs"
                          >
                            <Send className="w-3 h-3" /> Disparar Lembrete
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Stage 5: Inativo / VIP */}
                <div className={`rounded-xl border p-4 flex flex-col min-h-[450px] ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-500">
                      VIP & Fidelizados
                    </span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 text-[10px] font-bold">
                      {crmLeads.filter((l) => l.stage === 'VIP').length}
                    </span>
                  </div>
                  <div className="mt-3 flex-1 space-y-3">
                    {crmLeads
                      .filter((l) => l.stage === 'VIP')
                      .map((lead) => (
                        <div key={lead.id} className={`rounded-lg border p-3 ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-xs">{lead.name}</p>
                            <Award className="w-3.5 h-3.5 text-purple-500" />
                          </div>
                          <p className="text-[11px] text-purple-600 font-bold mt-1">LTV: {formatPrice(lead.lifetimeValue)}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{lead.totalAppointments} visitas registradas</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 4: CONTATOS */}
          {/* ========================================================================= */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Diretório de Clientes
                  </h2>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Base completa de contatos com histórico e frequência de atendimentos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewContactModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0624C7] text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  Novo Contato
                </button>
              </div>

              <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar contatos por nome ou telefone..."
                      value={crmSearch}
                      onChange={(e) => setCrmSearch(e.target.value)}
                      className={`w-full rounded-lg border py-2 pl-9 pr-4 text-xs outline-none transition-all ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {crmLeads
                    .filter((l) => l.name.toLowerCase().includes(crmSearch.toLowerCase()) || l.phone.includes(crmSearch))
                    .map((client) => (
                      <div key={client.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 font-bold text-sm shrink-0">
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{client.name}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">{client.phone}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="hidden sm:block text-right">
                            <span className="text-xs font-semibold text-slate-500">LTV Acumulado</span>
                            <p className="text-sm font-bold text-blue-600">{formatPrice(client.lifetimeValue)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSendWhatsApp(client.phone, `Olá ${client.name}! Como podemos ajudar hoje?`)}
                            className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                            title="Conversar no WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 5: CAIXA DE ENTRADA (Simulador de Chat / WhatsApp) */}
          {/* ========================================================================= */}
          {activeTab === 'inbox' && (
            <div className="space-y-6">
              <div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Caixa de Entrada & Mensagens
                </h2>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Central de atendimento e comunicação direta com seus clientes via WhatsApp.
                </p>
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-3 rounded-xl border overflow-hidden min-h-[500px] ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                {/* Conversations Sidebar */}
                <div className={`border-r p-4 space-y-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Recentes</h3>
                  {appointments.slice(0, 5).map((app) => (
                    <div
                      key={app.id}
                      onClick={() => handleSendWhatsApp(app.client.phone, `Olá ${app.client.name}! Tudo bem?`)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs">{app.client.name}</span>
                        <span className="text-[10px] text-slate-400">Hoje</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-1">
                        Agendamento de {app.service.name}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Chat Preview */}
                <div className="md:col-span-2 flex flex-col justify-between p-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs">
                      <p className="font-semibold text-blue-600 dark:text-blue-400">Atendimento WhatsApp Conectado</p>
                      <p className="text-slate-500 mt-1">
                        Você pode disparar notificações personalizadas para qualquer cliente com 1 clique direto no WhatsApp Web ou App.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Digite uma mensagem rápida para enviar ao cliente..."
                      className={`flex-1 rounded-lg border py-2.5 px-4 text-xs outline-none ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                    <button
                      type="button"
                      className="px-4 py-2.5 rounded-lg bg-[#0624C7] text-white text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Enviar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 6: NOTIFICAÇÕES */}
          {/* ========================================================================= */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Central de Notificações
                </h2>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Lembretes pendentes de confirmação e clientes na janela ideal de retorno.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card 1: Próximos Cortes */}
                <div className={`rounded-xl border p-5 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                  <h3 className="font-bold text-sm flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Agendamentos Próximos (&lt; 48h)
                  </h3>
                  <div className="space-y-3">
                    {appointments.map((app) => (
                      <div key={app.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-xs">{app.client.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{app.service.name} • {new Date(app.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSendWhatsApp(app.client.phone, `Olá ${app.client.name}! Lembramos que seu corte está confirmado para hoje às ${new Date(app.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}!`)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Lembrar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 2: Clientes para Retorno */}
                <div className={`rounded-xl border p-5 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                  <h3 className="font-bold text-sm flex items-center gap-2 mb-3 text-amber-600">
                    <Flame className="w-4 h-4 text-amber-500" />
                    Lembretes de Retorno (15-30 dias)
                  </h3>
                  <div className="space-y-3">
                    {crmLeads.filter((l) => l.stage === 'RETURN_DUE').map((lead) => (
                      <div key={lead.id} className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/40 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-xs">{lead.name}</p>
                          <p className="text-[11px] text-amber-600 font-medium mt-0.5">{lead.daysSinceLastVisit} dias sem cortar</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSendWhatsApp(lead.phone, `Olá ${lead.name}! Passando para avisar que já faz ${lead.daysSinceLastVisit} dias do seu último corte. Que tal agendar para essa semana?`)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-500 text-white hover:bg-amber-600"
                        >
                          Enviar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 7: DISPAROS (WhatsApp Broadcast Tool) */}
          {/* ========================================================================= */}
          {activeTab === 'broadcasts' && (
            <div className="space-y-6">
              <div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Disparos & Campanhas de WhatsApp
                </h2>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Envie mensagens em lote ou individuais para fidelizar e reengajar clientes.
                </p>
              </div>

              <div className={`rounded-xl border p-6 max-w-3xl space-y-4 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                <div>
                  <label className="text-xs font-semibold block mb-1">Público-Alvo:</label>
                  <select
                    value={selectedRecipientType}
                    onChange={(e: any) => setSelectedRecipientType(e.target.value)}
                    className={`w-full rounded-lg border py-2 px-3 text-xs outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="manual">Destinatário Manual (Digitar telefone)</option>
                    <option value="today">Todos os clientes com agendamento HOJE</option>
                    <option value="tomorrow">Todos os clientes com agendamento AMANHÃ</option>
                    <option value="return_due">Clientes na janela de retorno (15-30 dias sem visita)</option>
                    <option value="all">Toda a base de clientes cadastrada</option>
                  </select>
                </div>

                {selectedRecipientType === 'manual' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold block mb-1">Nome do Cliente:</label>
                      <input
                        type="text"
                        placeholder="Ex: Carlos Silva"
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        className={`w-full rounded-lg border py-2 px-3 text-xs outline-none ${
                          isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1">WhatsApp (com DDD):</label>
                      <input
                        type="text"
                        placeholder="Ex: 13999999999"
                        value={manualPhone}
                        onChange={(e) => setManualPhone(e.target.value)}
                        className={`w-full rounded-lg border py-2 px-3 text-xs outline-none ${
                          isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold block mb-1">Modelo de Mensagem:</label>
                  <textarea
                    rows={4}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className={`w-full rounded-lg border p-3 text-xs outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Use {'{Nome}'} para personalizar dinamicamente com o nome de cada destinatário.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (selectedRecipientType === 'manual') {
                      if (!manualPhone) {
                        alert('Informe o telefone.');
                        return;
                      }
                      handleSendWhatsApp(manualPhone, customMessage.replace('{Nome}', manualName || 'Amigo'));
                    } else if (selectedRecipientType === 'return_due') {
                      const targets = crmLeads.filter((l) => l.stage === 'RETURN_DUE');
                      if (targets.length === 0) {
                        alert('Nenhum cliente na janela de retorno no momento.');
                        return;
                      }
                      targets.forEach((t) => {
                        handleSendWhatsApp(t.phone, customMessage.replace('{Nome}', t.name));
                      });
                    } else {
                      alert('Disparo em lote simulado com sucesso para a lista selecionada!');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <Radio className="w-4 h-4" />
                  Iniciar Disparo WhatsApp
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 8: AUTOMAÇÕES, FLUXOS & AGENTES */}
          {/* ========================================================================= */}
          {(activeTab === 'automations' || activeTab === 'flows' || activeTab === 'agents') && (
            <div className="space-y-6">
              <div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {activeTab === 'automations' ? 'Automações Inteligentes' : activeTab === 'flows' ? 'Fluxos de Atendimento (BETA)' : 'Agentes de IA'}
                </h2>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Regras automáticas de retorno, disparo de confirmação 24h antes e atendente virtual.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`rounded-xl border p-5 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                      <Zap className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-bold">
                      ATIVO
                    </span>
                  </div>
                  <h4 className="font-bold text-sm">Lembrete de Retorno (20 dias)</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Gera automaticamente um alerta no funil quando o cliente completa 20 dias da última visita.
                  </p>
                </div>

                <div className={`rounded-xl border p-5 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                      <Clock className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-bold">
                      ATIVO
                    </span>
                  </div>
                  <h4 className="font-bold text-sm">Confirmação 24h Antes</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Prepara o WhatsApp de confirmação com link do endereço e horário exato.
                  </p>
                </div>

                <div className={`rounded-xl border p-5 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                      <Bot className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 font-bold">
                      AGENTE IA
                    </span>
                  </div>
                  <h4 className="font-bold text-sm">Assistente de Recepção</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Sugere horários livres com base na disponibilidade em tempo real dos barbeiros.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 9: CONFIGURAÇÕES (CMS DA BARBEARIA) */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Configurações da Barbearia (CMS)
                </h2>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Altere nome do salão, WhatsApp comercial, endereço e links exibidos na landing page.
                </p>
              </div>

              <form onSubmit={handleSaveCMS} className={`rounded-xl border p-6 max-w-2xl space-y-4 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                <div>
                  <label className="text-xs font-semibold block mb-1">Nome no Hero / Destaque:</label>
                  <input
                    type="text"
                    value={heroName}
                    onChange={(e) => setHeroName(e.target.value)}
                    className={`w-full rounded-lg border py-2 px-3 text-xs outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">WhatsApp de Atendimento:</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className={`w-full rounded-lg border py-2 px-3 text-xs outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">Instagram:</label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className={`w-full rounded-lg border py-2 px-3 text-xs outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">Endereço Completo:</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`w-full rounded-lg border py-2 px-3 text-xs outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingConfig}
                    className="px-6 py-2.5 rounded-lg bg-[#0624C7] text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
                  >
                    {savingConfig ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: NOVO CONTATO */}
      {/* ========================================================================= */}
      {newContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-xl ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Adicionar Novo Contato</h3>
              <button
                type="button"
                onClick={() => setNewContactModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Nome Completo:</label>
                <input
                  type="text"
                  placeholder="Ex: Lucas Mendes"
                  value={newContactData.name}
                  onChange={(e) => setNewContactData({ ...newContactData, name: e.target.value })}
                  className={`w-full rounded-lg border py-2 px-3 text-xs outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">WhatsApp com DDD:</label>
                <input
                  type="text"
                  placeholder="Ex: 13999999999"
                  value={newContactData.phone}
                  onChange={(e) => setNewContactData({ ...newContactData, phone: e.target.value })}
                  className={`w-full rounded-lg border py-2 px-3 text-xs outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Observações:</label>
                <textarea
                  rows={2}
                  placeholder="Preferência de corte, estilo de barba, etc."
                  value={newContactData.notes}
                  onChange={(e) => setNewContactData({ ...newContactData, notes: e.target.value })}
                  className={`w-full rounded-lg border p-2 text-xs outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewContactModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newContactData.name || !newContactData.phone) {
                    alert('Preencha nome e telefone.');
                    return;
                  }
                  setCrmLeads((prev) => [
                    {
                      id: `manual-${Date.now()}`,
                      name: newContactData.name,
                      phone: newContactData.phone,
                      email: null,
                      stage: 'NEW_LEAD',
                      totalAppointments: 0,
                      completedAppointments: 0,
                      lifetimeValue: 0,
                      daysSinceLastVisit: null,
                      lastVisitDate: null,
                      lastService: null,
                      lastBarber: null,
                      nextAppointment: null,
                      isReturnDue: false,
                      isUpcomingSoon: false,
                      recommendedAction: 'CONFIRM_BOOKING',
                      createdAt: new Date().toISOString(),
                    },
                    ...prev,
                  ]);
                  setNewContactModal(false);
                  setNewContactData({ name: '', phone: '', email: '', notes: '' });
                  setActiveTab('pipelines');
                }}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-[#0624C7] text-white hover:bg-blue-700 transition-colors shadow-xs"
              >
                Salvar Contato
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
