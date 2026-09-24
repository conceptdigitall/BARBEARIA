'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
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
  Plus,
  Trash2,
  Edit3,
  Upload,
  Tag,
  CheckCircle2,
  Layers,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon
} from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  promoPrice: number | null;
  promoStartDate: string | null;
  promoEndDate: string | null;
  durationMin: number;
  imageUrl: string | null;
  displayOrder: number;
  allowedBarberIds: string[];
  isActive: boolean;
}

interface BarberItem {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
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
  // Tabs: appointments | notifications | reports | availability | whatsapp | cms | services
  const [activeTab, setActiveTab] = useState<'appointments' | 'notifications' | 'reports' | 'availability' | 'whatsapp' | 'cms' | 'services'>('appointments');

  // Services Management State
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);
  const [barbersList, setBarbersList] = useState<BarberItem[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('ALL');

  // Modal & Form State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    category: 'corte',
    price: '',
    promoPrice: '',
    promoStartDate: '',
    promoEndDate: '',
    durationMin: 30,
    imageUrl: '',
    displayOrder: 1,
    allowedBarberIds: [] as string[],
    isActive: true,
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [serviceFormError, setServiceFormError] = useState<string | null>(null);
  const [serviceFormSuccess, setServiceFormSuccess] = useState<string | null>(null);
  const [savingService, setSavingService] = useState(false);

  // Fetch Services API
  const fetchServices = useCallback(async () => {
    setLoadingServices(true);
    try {
      const res = await fetch('/api/admin/services');
      if (res.ok) {
        const data = await res.json();
        setServicesList(data.services || []);
        setBarbersList(data.barbers || []);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoadingServices(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    if (activeTab === 'services') {
      fetchServices();
    }
  }, [activeTab, fetchServices]);

  // Check if promo is currently active
  const checkIsPromoActive = (s: ServiceItem) => {
    if (s.promoPrice === null || s.promoPrice === undefined || Number(s.promoPrice) <= 0) return false;
    const now = new Date();
    if (s.promoStartDate && new Date(s.promoStartDate) > now) return false;
    if (s.promoEndDate && new Date(s.promoEndDate) < now) return false;
    return true;
  };

  // Open Create Service Modal
  const handleOpenCreateModal = () => {
    setEditingServiceId(null);
    setServiceForm({
      name: '',
      description: '',
      category: 'corte',
      price: '',
      promoPrice: '',
      promoStartDate: '',
      promoEndDate: '',
      durationMin: 30,
      imageUrl: '',
      displayOrder: servicesList.length + 1,
      allowedBarberIds: barbersList.map(b => b.id),
      isActive: true,
    });
    setServiceFormError(null);
    setServiceFormSuccess(null);
    setIsServiceModalOpen(true);
  };

  // Open Edit Service Modal
  const handleOpenEditModal = (service: ServiceItem) => {
    setEditingServiceId(service.id);
    
    const formatForInput = (isoStr: string | null) => {
      if (!isoStr) return '';
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return '';
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setServiceForm({
      name: service.name,
      description: service.description || '',
      category: service.category || 'corte',
      price: String(service.price),
      promoPrice: service.promoPrice !== null && service.promoPrice !== undefined ? String(service.promoPrice) : '',
      promoStartDate: formatForInput(service.promoStartDate),
      promoEndDate: formatForInput(service.promoEndDate),
      durationMin: service.durationMin || 30,
      imageUrl: service.imageUrl || '',
      displayOrder: service.displayOrder || 1,
      allowedBarberIds: service.allowedBarberIds || [],
      isActive: service.isActive !== undefined ? service.isActive : true,
    });
    setServiceFormError(null);
    setServiceFormSuccess(null);
    setIsServiceModalOpen(true);
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setServiceFormError('O tamanho da imagem não pode exceder 5MB.');
      return;
    }

    setUploadingImage(true);
    setServiceFormError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/services/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setServiceForm(prev => ({ ...prev, imageUrl: data.imageUrl }));
        setServiceFormSuccess('Imagem enviada com sucesso!');
        setTimeout(() => setServiceFormSuccess(null), 3000);
      } else {
        const data = await res.json();
        setServiceFormError(data.error || 'Erro ao enviar imagem.');
      }
    } catch (err) {
      console.error(err);
      setServiceFormError('Erro de conexão ao enviar imagem.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Service (Create or Update)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setServiceFormError(null);
    setServiceFormSuccess(null);

    if (!serviceForm.name.trim()) {
      setServiceFormError('O nome do serviço é obrigatório.');
      return;
    }

    if (!serviceForm.price || Number(serviceForm.price) <= 0) {
      setServiceFormError('Informe um preço normal válido maior que zero.');
      return;
    }

    if (serviceForm.promoPrice && Number(serviceForm.promoPrice) > Number(serviceForm.price)) {
      setServiceFormError('O preço promocional não pode ser maior que o preço normal.');
      return;
    }

    if (serviceForm.promoStartDate && serviceForm.promoEndDate && new Date(serviceForm.promoEndDate) < new Date(serviceForm.promoStartDate)) {
      setServiceFormError('A data final da promoção não pode ser anterior à data inicial.');
      return;
    }

    setSavingService(true);

    const payload = {
      name: serviceForm.name,
      description: serviceForm.description,
      category: serviceForm.category,
      price: Number(serviceForm.price),
      promoPrice: serviceForm.promoPrice ? Number(serviceForm.promoPrice) : null,
      promoStartDate: serviceForm.promoStartDate ? new Date(serviceForm.promoStartDate).toISOString() : null,
      promoEndDate: serviceForm.promoEndDate ? new Date(serviceForm.promoEndDate).toISOString() : null,
      durationMin: Number(serviceForm.durationMin),
      imageUrl: serviceForm.imageUrl,
      displayOrder: Number(serviceForm.displayOrder),
      allowedBarberIds: serviceForm.allowedBarberIds,
      isActive: serviceForm.isActive,
    };

    try {
      const url = editingServiceId ? `/api/admin/services/${editingServiceId}` : '/api/admin/services';
      const method = editingServiceId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const saved = data.service;

        if (editingServiceId) {
          setServicesList(prev => prev.map(s => s.id === editingServiceId ? { ...s, ...saved } : s));
        } else {
          setServicesList(prev => [...prev, saved]);
        }

        setServiceFormSuccess(editingServiceId ? 'Serviço atualizado com sucesso!' : 'Novo serviço criado com sucesso!');
        setTimeout(() => {
          setIsServiceModalOpen(false);
          setServiceFormSuccess(null);
        }, 1200);
      } else {
        const data = await res.json();
        setServiceFormError(data.error || 'Erro ao salvar serviço.');
      }
    } catch (err) {
      console.error(err);
      setServiceFormError('Erro de conexão ao salvar serviço.');
    } finally {
      setSavingService(false);
    }
  };

  // Toggle Service Active Status
  const handleToggleServiceActive = async (service: ServiceItem) => {
    const newStatus = !service.isActive;
    setServicesList(prev => prev.map(s => s.id === service.id ? { ...s, isActive: newStatus } : s));

    try {
      await fetch(`/api/admin/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Change Service Order
  const handleMoveServiceOrder = async (service: ServiceItem, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' ? Math.max(1, service.displayOrder - 1) : service.displayOrder + 1;
    setServicesList(prev => prev.map(s => s.id === service.id ? { ...s, displayOrder: newOrder } : s));

    try {
      await fetch(`/api/admin/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayOrder: newOrder }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Service
  const handleDeleteService = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir ou inativar o serviço "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setServicesList(prev => prev.filter(s => s.id !== id));
      } else {
        alert('Erro ao excluir serviço.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Services List
  const filteredServices = useMemo(() => {
    return servicesList.filter(s => {
      if (serviceCategoryFilter === 'ALL') return true;
      if (serviceCategoryFilter === 'PROMO') return checkIsPromoActive(s);
      if (serviceCategoryFilter === 'INACTIVE') return !s.isActive;
      return s.category.toLowerCase() === serviceCategoryFilter.toLowerCase();
    }).sort((a, b) => a.displayOrder - b.displayOrder);
  }, [servicesList, serviceCategoryFilter]);
  
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

  // Fetch availability and clients on mount
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
  }, []);

  // Fetch reports when tab changes or month/year changes
  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReport(reportMonth, reportYear);
    }
  }, [activeTab, reportMonth, reportYear, fetchReport]);

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
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-10 font-sans selection:bg-gold-primary selection:text-black">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-graphite-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-gold-primary uppercase tracking-[0.2em] text-[11px] font-bold">
                Painel Administrativo
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Sistema Online
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white uppercase tracking-wider flex items-center gap-3">
              BarberConnect
            </h1>
          </div>

          {/* Top Info & Live Sync Status */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchAppointments(selectedDate)}
              disabled={loadingAppointments}
              className="px-3.5 py-2 bg-graphite-dark hover:bg-white/5 border border-graphite-border text-xs text-white/80 hover:text-gold-primary flex items-center gap-2 transition-all"
              title="Sincronizar agora"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAppointments ? 'animate-spin text-gold-primary' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            <button
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              className={`px-3 py-2 text-xs border flex items-center gap-1.5 transition-colors ${
                autoRefreshEnabled 
                  ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' 
                  : 'border-graphite-border text-white/40 bg-graphite-dark'
              }`}
              title="Alternar atualização automática a cada 30 segundos"
            >
              <span className={`w-2 h-2 rounded-full ${autoRefreshEnabled ? 'bg-emerald-400 animate-ping' : 'bg-white/20'}`} />
              <span>{autoRefreshEnabled ? 'Ao Vivo (30s)' : 'Sincronização Pausada'}</span>
            </button>

            <div className="text-xs text-white/60 bg-graphite-dark px-4 py-2 border border-graphite-border hidden lg:block">
              Hoje: {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="flex overflow-x-auto border-b border-graphite-border gap-1 sm:gap-2 pb-px no-scrollbar">
          {/* Tab 1: Agenda / Agendamentos */}
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 sm:px-5 py-3 font-serif text-xs font-bold uppercase tracking-widest transition-all duration-200 border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'appointments'
                ? 'border-gold-primary text-gold-primary bg-gold-primary/5'
                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Agenda & Horários
          </button>

          {/* Tab 2: Notificações (com badge) */}
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 sm:px-5 py-3 font-serif text-xs font-bold uppercase tracking-widest transition-all duration-200 border-b-2 flex items-center gap-2 whitespace-nowrap relative ${
              activeTab === 'notifications'
                ? 'border-gold-primary text-gold-primary bg-gold-primary/5'
                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bell className="w-4 h-4" />
            Notificações
            {notificationCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-rose-500 text-white animate-pulse">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Tab 3: Relatórios & Faturamento Mensal */}
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 sm:px-5 py-3 font-serif text-xs font-bold uppercase tracking-widest transition-all duration-200 border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'reports'
                ? 'border-gold-primary text-gold-primary bg-gold-primary/5'
                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Relatórios & Finanças
          </button>

          {/* Tab 4: Escala Horária */}
          <button
            onClick={() => setActiveTab('availability')}
            className={`px-4 sm:px-5 py-3 font-serif text-xs font-bold uppercase tracking-widest transition-all duration-200 border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'availability'
                ? 'border-gold-primary text-gold-primary bg-gold-primary/5'
                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-4 h-4" />
            Escala Horária
          </button>

          {/* Tab 5: Disparos WhatsApp */}
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-4 sm:px-5 py-3 font-serif text-xs font-bold uppercase tracking-widest transition-all duration-200 border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'whatsapp'
                ? 'border-gold-primary text-gold-primary bg-gold-primary/5'
                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Disparos WhatsApp
          </button>

          {/* Tab 6: Configurações do Site (CMS) */}
          <button
            onClick={() => setActiveTab('cms')}
            className={`px-4 sm:px-5 py-3 font-serif text-xs font-bold uppercase tracking-widest transition-all duration-200 border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'cms'
                ? 'border-gold-primary text-gold-primary bg-gold-primary/5'
                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-4 h-4" />
            Configurações
          </button>

          {/* Tab 7: Gestão Completa de Serviços */}
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 sm:px-5 py-3 font-serif text-xs font-bold uppercase tracking-widest transition-all duration-200 border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'services'
                ? 'border-gold-primary text-gold-primary bg-gold-primary/5'
                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Scissors className="w-4 h-4" />
            Serviços
            {servicesList.some(s => checkIsPromoActive(s)) && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                PROMO
              </span>
            )}
          </button>
        </nav>

        {/* ========================================================================= */}
        {/* TAB 1: AGENDA EM TEMPO REAL & GESTÃO DE HORÁRIOS */}
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
        {/* TAB 5: DISPAROS DE WHATSAPP APRIMORADOS */}
        {/* ========================================================================= */}
        {activeTab === 'whatsapp' && (
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
        {/* TAB 6: CONFIGURAÇÕES DO SITE (CMS) */}
        {/* ========================================================================= */}
        {activeTab === 'cms' && (
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

        {/* ========================================================================= */}
        {/* TAB 7: GESTÃO E EDIÇÃO COMPLETA DE SERVIÇOS */}
        {/* ========================================================================= */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            
            {/* Header Control Bar */}
            <div className="glass-panel p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-gold-primary/10">
              <div>
                <span className="text-[10px] text-gold-primary uppercase tracking-[0.25em] font-bold block mb-1">
                  Catálogo & Tabela de Preços
                </span>
                <h2 className="text-2xl font-bold font-serif text-white uppercase tracking-wider flex items-center gap-3">
                  Gerenciamento de Serviços
                </h2>
                <p className="text-xs text-white/50 font-light mt-1">
                  Cadastre, edite valores, configure promoções com encerramento automático e ajuste barbeiros habilitados.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto">
                <button
                  onClick={fetchServices}
                  disabled={loadingServices}
                  className="px-4 py-2.5 bg-graphite-dark hover:bg-white/5 border border-graphite-border text-xs text-white/80 hover:text-gold-primary flex items-center gap-2 transition-all"
                  title="Atualizar lista"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingServices ? 'animate-spin text-gold-primary' : ''}`} />
                  <span>Atualizar</span>
                </button>

                <button
                  onClick={handleOpenCreateModal}
                  className="px-5 py-2.5 bg-gold-primary hover:bg-gold-hover text-black font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(197,168,128,0.25)] flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Serviço</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
              {[
                { id: 'ALL', label: 'Todos os Serviços' },
                { id: 'corte', label: 'Cortes' },
                { id: 'barba', label: 'Barba' },
                { id: 'combo', label: 'Combos' },
                { id: 'sobrancelha', label: 'Sobrancelha' },
                { id: 'pezinho', label: 'Pezinho' },
                { id: 'PROMO', label: '🔥 Em Promoção' },
                { id: 'INACTIVE', label: 'Inativos' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setServiceCategoryFilter(cat.id)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${
                    serviceCategoryFilter === cat.id
                      ? 'bg-gold-primary text-black border-gold-primary shadow-sm shadow-gold-primary/20'
                      : 'bg-graphite-dark text-white/60 border-graphite-border hover:text-white hover:border-gold-primary/40'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Services Grid List */}
            {loadingServices ? (
              <div className="p-16 text-center text-white/40 flex flex-col items-center justify-center gap-3 glass-panel">
                <RefreshCw className="w-6 h-6 animate-spin text-gold-primary" />
                <span>Carregando catálogo de serviços...</span>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="p-16 text-center text-white/40 glass-panel space-y-3">
                <Scissors className="w-10 h-10 mx-auto text-white/20" />
                <p className="text-sm font-light">Nenhum serviço encontrado no filtro selecionado.</p>
                <button
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 bg-gold-primary/10 text-gold-primary border border-gold-primary/30 text-xs font-bold uppercase tracking-wider hover:bg-gold-primary hover:text-black transition-all"
                >
                  Cadastrar Primeiro Serviço
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => {
                  const hasPromo = checkIsPromoActive(service);
                  const allowedBarberNames = barbersList
                    .filter(b => !service.allowedBarberIds || service.allowedBarberIds.length === 0 || service.allowedBarberIds.includes(b.id))
                    .map(b => b.name);

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={service.id}
                      className={`glass-panel p-5 border flex flex-col justify-between relative group transition-all duration-300 ${
                        !service.isActive 
                          ? 'border-graphite-border/40 opacity-60 bg-black/40' 
                          : hasPromo 
                            ? 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.1)]' 
                            : 'border-gold-primary/20 hover:border-gold-primary/50'
                      }`}
                    >
                      {/* Top Badges & Image Preview */}
                      <div>
                        <div className="relative h-40 w-full mb-4 overflow-hidden rounded bg-black/60 border border-graphite-border/60">
                          {service.imageUrl ? (
                            <Image
                              src={service.imageUrl}
                              alt={service.name}
                              fill
                              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-white/20 bg-gradient-to-b from-graphite-dark to-black">
                              <Scissors className="w-10 h-10 mb-1 text-gold-primary/40" />
                              <span className="text-[10px] uppercase tracking-wider">Sem Imagem</span>
                            </div>
                          )}

                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                          {/* Order Pill */}
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 border border-white/20 text-[10px] font-mono text-white/80 rounded">
                            #{service.displayOrder}
                          </div>

                          {/* Category Badge */}
                          <div className="absolute top-2 right-2 px-2.5 py-0.5 bg-gold-primary text-black font-bold uppercase tracking-widest text-[9px]">
                            {service.category}
                          </div>

                          {/* Promo Badge */}
                          {hasPromo && (
                            <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-amber-500 text-black font-bold uppercase tracking-widest text-[10px] flex items-center gap-1 shadow-md animate-pulse">
                              <Sparkles className="w-3 h-3" />
                              Promoção Ativa
                            </div>
                          )}

                          {/* Inactive Badge */}
                          {!service.isActive && (
                            <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-rose-500/80 text-white font-bold uppercase tracking-widest text-[10px]">
                              Inativo
                            </div>
                          )}
                        </div>

                        {/* Title & Description */}
                        <div className="mb-4">
                          <h3 className="font-serif text-xl font-bold text-white uppercase tracking-wide group-hover:text-gold-primary transition-colors">
                            {service.name}
                          </h3>
                          <p className="text-xs text-white/60 font-light mt-1.5 leading-relaxed line-clamp-2">
                            {service.description || 'Sem descrição cadastrada.'}
                          </p>
                        </div>

                        {/* Price & Promo Info */}
                        <div className="p-3 bg-black/40 border border-graphite-border/60 rounded mb-4">
                          <div className="flex items-baseline justify-between">
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Preço:</span>
                            <div className="text-right">
                              {hasPromo ? (
                                <div>
                                  <span className="text-xs text-white/40 line-through mr-2">
                                    {formatPrice(service.price)}
                                  </span>
                                  <span className="text-xl font-bold text-gold-primary font-serif">
                                    {formatPrice(service.promoPrice!)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xl font-bold text-white font-serif">
                                  {formatPrice(service.price)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Promo Date Validity Info */}
                          {hasPromo && service.promoEndDate && (
                            <div className="text-[10px] text-amber-400/90 mt-1 pt-1 border-t border-white/5 flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3" />
                              <span>Válido até: {new Date(service.promoEndDate).toLocaleDateString('pt-BR')} às {new Date(service.promoEndDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          )}
                        </div>

                        {/* Operational Details */}
                        <div className="space-y-2 text-xs text-white/60 mb-6">
                          <div className="flex items-center justify-between border-b border-graphite-border/30 pb-1.5">
                            <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Duração:</span>
                            <span className="font-medium text-white flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gold-primary" />
                              {service.durationMin} min
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Barbeiros:</span>
                            <span className="font-medium text-white text-[11px] truncate max-w-[150px]" title={allowedBarberNames.join(', ')}>
                              {allowedBarberNames.length > 0 ? allowedBarberNames.join(', ') : 'Todos'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons Footer */}
                      <div className="pt-3 border-t border-graphite-border/60 flex items-center justify-between gap-2">
                        {/* Order adjustment buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveServiceOrder(service, 'up')}
                            className="p-1.5 bg-graphite-dark hover:bg-white/10 text-white/60 hover:text-gold-primary border border-graphite-border"
                            title="Mover para cima"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveServiceOrder(service, 'down')}
                            className="p-1.5 bg-graphite-dark hover:bg-white/10 text-white/60 hover:text-gold-primary border border-graphite-border"
                            title="Mover para baixo"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Status Active Toggle */}
                        <button
                          onClick={() => handleToggleServiceActive(service)}
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                            service.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
                          }`}
                          title="Alternar Ativo/Inativo"
                        >
                          {service.isActive ? 'Ativo' : 'Inativo'}
                        </button>

                        {/* Edit & Delete Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(service)}
                            className="p-2 bg-gold-primary/10 hover:bg-gold-primary text-gold-primary hover:text-black border border-gold-primary/30 transition-all font-bold text-xs flex items-center gap-1"
                            title="Editar serviço"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Editar</span>
                          </button>

                          <button
                            onClick={() => handleDeleteService(service.id, service.name)}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 transition-all"
                            title="Excluir serviço"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL DE CRIAÇÃO E EDIÇÃO COMPLETA DE SERVIÇO */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {isServiceModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="glass-panel w-full max-w-3xl bg-[#0A0A0B] border border-gold-primary/40 shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-6 sm:p-8 my-8 relative overflow-hidden"
              >
                {/* Modal Close Button */}
                <button
                  onClick={() => setIsServiceModalOpen(false)}
                  className="absolute top-5 right-5 text-white/40 hover:text-gold-primary transition-colors p-1"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Modal Header */}
                <div className="flex items-center gap-3 border-b border-graphite-border pb-5 mb-6">
                  <div className="p-3 bg-gold-primary/10 border border-gold-primary/30 text-gold-primary">
                    <Scissors className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gold-primary uppercase tracking-[0.2em] font-bold block">
                      {editingServiceId ? 'Edição de Serviço' : 'Novo Cadastro'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold font-serif text-white uppercase tracking-wide">
                      {editingServiceId ? `Editar: ${serviceForm.name}` : 'Cadastrar Novo Serviço'}
                    </h3>
                  </div>
                </div>

                {/* Feedback Banners */}
                {serviceFormError && (
                  <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{serviceFormError}</span>
                  </div>
                )}

                {serviceFormSuccess && (
                  <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{serviceFormSuccess}</span>
                  </div>
                )}

                {/* Form Content */}
                <form onSubmit={handleSaveService} className="space-y-6">
                  
                  {/* SEÇÃO 1: DADOS BÁSICOS */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gold-primary flex items-center gap-2 border-b border-graphite-border/40 pb-2">
                      <Tag className="w-4 h-4" />
                      1. Dados Básicos do Serviço
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      {/* Nome do Serviço */}
                      <div className="sm:col-span-8 space-y-1.5">
                        <label className="text-xs text-white/70 font-semibold">Nome do Serviço *</label>
                        <input
                          type="text"
                          required
                          value={serviceForm.name}
                          onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                          placeholder="Ex: Corte Degradê Navalhado"
                          className="w-full px-4 py-2.5 bg-graphite-dark border border-graphite-border focus:border-gold-primary text-sm text-white outline-none transition-colors"
                        />
                      </div>

                      {/* Categoria */}
                      <div className="sm:col-span-4 space-y-1.5">
                        <label className="text-xs text-white/70 font-semibold">Categoria *</label>
                        <select
                          value={serviceForm.category}
                          onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                          className="w-full px-4 py-2.5 bg-graphite-dark border border-graphite-border focus:border-gold-primary text-sm text-white outline-none transition-colors cursor-pointer"
                        >
                          <option value="corte">Corte</option>
                          <option value="barba">Barba</option>
                          <option value="combo">Combo</option>
                          <option value="sobrancelha">Sobrancelha</option>
                          <option value="pezinho">Pezinho</option>
                          <option value="tratamento">Tratamento</option>
                          <option value="outros">Outros</option>
                        </select>
                      </div>

                      {/* Descrição curta */}
                      <div className="sm:col-span-12 space-y-1.5">
                        <label className="text-xs text-white/70 font-semibold">Descrição Detalhada</label>
                        <textarea
                          rows={2}
                          value={serviceForm.description}
                          onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                          placeholder="Descreva o que está incluso neste serviço para os clientes..."
                          className="w-full px-4 py-2.5 bg-graphite-dark border border-graphite-border focus:border-gold-primary text-sm text-white outline-none transition-colors resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SEÇÃO 2: PREÇO E PROMOÇÃO */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gold-primary flex items-center gap-2 border-b border-graphite-border/40 pb-2">
                      <DollarSign className="w-4 h-4" />
                      2. Valoração & Promoção (Desconto Programado)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      {/* Preço Normal */}
                      <div className="sm:col-span-6 space-y-1.5">
                        <label className="text-xs text-white/70 font-semibold">Preço Normal (R$) *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={serviceForm.price}
                          onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                          placeholder="40.00"
                          className="w-full px-4 py-2.5 bg-graphite-dark border border-graphite-border focus:border-gold-primary text-sm text-white font-serif outline-none"
                        />
                      </div>

                      {/* Preço Promocional */}
                      <div className="sm:col-span-6 space-y-1.5">
                        <label className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          Preço Promocional (R$) (Opcional)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={serviceForm.promoPrice}
                          onChange={(e) => setServiceForm({ ...serviceForm, promoPrice: e.target.value })}
                          placeholder="30.00 (Deixe em branco para sem promoção)"
                          className="w-full px-4 py-2.5 bg-graphite-dark border border-amber-500/40 focus:border-amber-400 text-sm text-amber-300 font-serif outline-none"
                        />
                      </div>

                      {/* Data Início Promoção */}
                      <div className="sm:col-span-6 space-y-1.5">
                        <label className="text-xs text-white/60">Data/Hora Início da Promoção</label>
                        <input
                          type="datetime-local"
                          value={serviceForm.promoStartDate}
                          onChange={(e) => setServiceForm({ ...serviceForm, promoStartDate: e.target.value })}
                          className="w-full px-4 py-2 bg-graphite-dark border border-graphite-border text-xs text-white outline-none cursor-pointer"
                        />
                      </div>

                      {/* Data Fim Promoção */}
                      <div className="sm:col-span-6 space-y-1.5">
                        <label className="text-xs text-white/60">Data/Hora Término da Promoção (Desativação Automática)</label>
                        <input
                          type="datetime-local"
                          value={serviceForm.promoEndDate}
                          onChange={(e) => setServiceForm({ ...serviceForm, promoEndDate: e.target.value })}
                          className="w-full px-4 py-2 bg-graphite-dark border border-graphite-border text-xs text-white outline-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SEÇÃO 3: OPERACIONAL E EQUIPE */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gold-primary flex items-center gap-2 border-b border-graphite-border/40 pb-2">
                      <Clock className="w-4 h-4" />
                      3. Duração e Barbeiros Habilitados
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      {/* Duração em minutos */}
                      <div className="sm:col-span-4 space-y-1.5">
                        <label className="text-xs text-white/70 font-semibold">Duração Estimada *</label>
                        <select
                          value={serviceForm.durationMin}
                          onChange={(e) => setServiceForm({ ...serviceForm, durationMin: Number(e.target.value) })}
                          className="w-full px-4 py-2.5 bg-graphite-dark border border-graphite-border focus:border-gold-primary text-sm text-white outline-none cursor-pointer"
                        >
                          <option value={15}>15 minutos</option>
                          <option value={30}>30 minutos</option>
                          <option value={45}>45 minutos</option>
                          <option value={60}>60 minutos (1h)</option>
                          <option value={90}>90 minutos (1h30)</option>
                          <option value={120}>120 minutos (2h)</option>
                        </select>
                      </div>

                      {/* Ordem de Exibição */}
                      <div className="sm:col-span-4 space-y-1.5">
                        <label className="text-xs text-white/70 font-semibold">Ordem na Lista</label>
                        <input
                          type="number"
                          min="1"
                          value={serviceForm.displayOrder}
                          onChange={(e) => setServiceForm({ ...serviceForm, displayOrder: Number(e.target.value) })}
                          className="w-full px-4 py-2.5 bg-graphite-dark border border-graphite-border text-sm text-white outline-none"
                        />
                      </div>

                      {/* Status Ativo */}
                      <div className="sm:col-span-4 flex items-center justify-start pt-6">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={serviceForm.isActive}
                            onChange={(e) => setServiceForm({ ...serviceForm, isActive: e.target.checked })}
                            className="w-4 h-4 accent-gold-primary cursor-pointer"
                          />
                          <span className="text-xs text-white font-semibold uppercase tracking-wider">
                            Serviço Ativo
                          </span>
                        </label>
                      </div>

                      {/* Barbeiros Habilitados Multi-seleção */}
                      <div className="sm:col-span-12 space-y-2 pt-2">
                        <label className="text-xs text-white/70 font-semibold block">
                          Profissionais/Barbeiros Habilitados
                        </label>
                        <div className="flex flex-wrap gap-3 bg-graphite-dark p-3 border border-graphite-border">
                          {barbersList.length === 0 ? (
                            <span className="text-xs text-white/40 italic">Todos os barbeiros ativos</span>
                          ) : (
                            barbersList.map((barber) => {
                              const isChecked = serviceForm.allowedBarberIds.includes(barber.id);
                              return (
                                <label
                                  key={barber.id}
                                  className={`px-3 py-1.5 border text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2 ${
                                    isChecked
                                      ? 'bg-gold-primary/20 border-gold-primary text-gold-primary'
                                      : 'bg-black/40 border-graphite-border text-white/40 hover:text-white'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setServiceForm({
                                          ...serviceForm,
                                          allowedBarberIds: [...serviceForm.allowedBarberIds, barber.id],
                                        });
                                      } else {
                                        setServiceForm({
                                          ...serviceForm,
                                          allowedBarberIds: serviceForm.allowedBarberIds.filter(id => id !== barber.id),
                                        });
                                      }
                                    }}
                                    className="hidden"
                                  />
                                  <span>{barber.name} ({barber.role})</span>
                                </label>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SEÇÃO 4: IMAGEM DO SERVIÇO */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gold-primary flex items-center gap-2 border-b border-graphite-border/40 pb-2">
                      <ImageIcon className="w-4 h-4" />
                      4. Imagem Ilustrativa do Serviço
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      {/* Image Preview Box */}
                      <div className="sm:col-span-4">
                        <div className="relative h-32 w-full rounded border border-graphite-border overflow-hidden bg-black/60 flex items-center justify-center">
                          {serviceForm.imageUrl ? (
                            <Image
                              src={serviceForm.imageUrl}
                              alt="Preview"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="text-center text-white/30 text-xs">
                              <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                              <span>Sem foto</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Image Upload Inputs */}
                      <div className="sm:col-span-8 space-y-3">
                        <div>
                          <label className="text-xs text-white/70 font-semibold block mb-1">Upload de Imagem (Max 5MB)</label>
                          <label className="px-4 py-2.5 bg-graphite-dark hover:bg-white/5 border border-gold-primary/40 text-gold-primary text-xs font-bold uppercase tracking-wider cursor-pointer inline-flex items-center gap-2 transition-all">
                            <Upload className="w-4 h-4" />
                            <span>{uploadingImage ? 'Enviando...' : 'Selecionar Imagem...'}</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/svg+xml"
                              onChange={handleImageUpload}
                              disabled={uploadingImage}
                              className="hidden"
                            />
                          </label>
                        </div>

                        <div>
                          <label className="text-xs text-white/40 font-semibold block mb-1">Ou informe a URL da Imagem</label>
                          <input
                            type="text"
                            value={serviceForm.imageUrl}
                            onChange={(e) => setServiceForm({ ...serviceForm, imageUrl: e.target.value })}
                            placeholder="/haircut-fade.png ou https://..."
                            className="w-full px-3 py-1.5 bg-graphite-dark border border-graphite-border text-xs text-white outline-none"
                          />
                        </div>

                        {serviceForm.imageUrl && (
                          <button
                            type="button"
                            onClick={() => setServiceForm({ ...serviceForm, imageUrl: '' })}
                            className="text-[10px] text-rose-400 underline hover:text-rose-300"
                          >
                            Remover Imagem
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form Action Buttons */}
                  <div className="pt-6 border-t border-graphite-border flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsServiceModalOpen(false)}
                      className="px-6 py-3 bg-graphite-dark hover:bg-white/5 text-white/70 font-bold text-xs uppercase tracking-wider transition-colors border border-graphite-border"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={savingService || uploadingImage}
                      className="px-8 py-3 bg-gold-primary hover:bg-gold-hover text-black font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(197,168,128,0.25)] flex items-center gap-2 disabled:opacity-50"
                    >
                      {savingService && <RefreshCw className="w-4 h-4 animate-spin" />}
                      <span>{savingService ? 'Salvando...' : editingServiceId ? 'Salvar Alterações' : 'Cadastrar Serviço'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
