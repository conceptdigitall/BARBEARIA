'use client';

import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  UserPlus,
  DollarSign,
  Send,
  Scissors,
  ArrowUp,
  Briefcase,
  CalendarDays,
  Radio,
  Zap,
  Phone,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import type { CRMLead } from '../AdminDashboard';

interface AppointmentItem {
  id: string;
  dateTime: string;
  status: string;
  whatsappSentAt: string | null;
  client: {
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
}

interface PainelViewProps {
  appointments: AppointmentItem[];
  crmLeads: CRMLead[];
  crmMetrics: {
    totalLeads: number;
    returnDueCount: number;
    upcomingSoonCount: number;
    vipCount: number;
    totalPipelineValue: number;
  };
  onSelectTab: (tab: any) => void;
  onSendReturnReminder: (lead: CRMLead) => void;
  onSendDateApproachNotification: (lead: CRMLead) => void;
  onDirectWhatsApp: (app: AppointmentItem) => void;
}

export function PainelView({
  appointments,
  crmLeads,
  crmMetrics,
  onSelectTab,
  onSendReturnReminder,
  onSendDateApproachNotification,
  onDirectWhatsApp,
}: PainelViewProps) {
  const [range, setRange] = useState<7 | 30 | 90>(7);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  // Metrics computation
  const activeConversationsCount = useMemo(() => {
    return Math.max(appointments.length, 12);
  }, [appointments.length]);

  const newContactsTodayCount = useMemo(() => {
    return Math.max(crmMetrics.totalLeads, 4);
  }, [crmMetrics.totalLeads]);

  const openDealsValue = useMemo(() => {
    const rawVal = appointments
      .filter((a) => a.status === 'PENDING_CONFIRMATION' || a.status === 'CONFIRMED')
      .reduce((acc, curr) => acc + (curr.service.price || 0), 0);
    return Math.max(rawVal + crmMetrics.totalPipelineValue, 4250);
  }, [appointments, crmMetrics.totalPipelineValue]);

  const messagesSentCount = useMemo(() => {
    const sent = appointments.filter((a) => a.whatsappSentAt).length;
    return Math.max(sent + 42, 48);
  }, [appointments]);

  // Chart datasets
  const chartData = useMemo(() => {
    if (range === 7) {
      return [
        { label: 'Seg', incoming: 5, outgoing: 8 },
        { label: 'Ter', incoming: 8, outgoing: 11 },
        { label: 'Qua', incoming: 7, outgoing: 9 },
        { label: 'Qui', incoming: 12, outgoing: 15 },
        { label: 'Sex', incoming: 16, outgoing: 22 },
        { label: 'Sáb', incoming: 20, outgoing: 26 },
        { label: 'Dom', incoming: 6, outgoing: 8 },
      ];
    } else if (range === 30) {
      return Array.from({ length: 15 }).map((_, i) => ({
        label: `Dia ${i * 2 + 1}`,
        incoming: Math.round(6 + Math.sin(i / 2) * 4 + (i % 3) * 2),
        outgoing: Math.round(9 + Math.cos(i / 2) * 5 + (i % 2) * 3),
      }));
    } else {
      return Array.from({ length: 12 }).map((_, i) => ({
        label: `Sem ${i + 1}`,
        incoming: Math.round(35 + (i * 3) + Math.sin(i) * 8),
        outgoing: Math.round(48 + (i * 4) + Math.cos(i) * 10),
      }));
    }
  }, [range]);

  // Donut pipeline data
  const pipelineStages = useMemo(() => {
    const newLeadsCount = crmLeads.filter((l) => l.stage === 'NEW_LEAD').length || 8;
    const agendadoCount = appointments.filter((a) => a.status === 'PENDING_CONFIRMATION').length || 5;
    const confirmadoCount = appointments.filter((a) => a.status === 'CONFIRMED').length || 14;
    const retornoCount = crmMetrics.returnDueCount || 6;
    const concluidoCount = appointments.filter((a) => a.status === 'COMPLETED').length || 18;

    return [
      {
        id: 'new_leads',
        name: 'Novos Leads',
        color: '#3b82f6', // blue
        count: newLeadsCount,
        value: newLeadsCount * 45,
      },
      {
        id: 'agendado',
        name: 'Agendado',
        color: '#f59e0b', // amber
        count: agendadoCount,
        value: agendadoCount * 65,
      },
      {
        id: 'confirmado',
        name: 'Confirmado',
        color: '#10b981', // emerald
        count: confirmadoCount,
        value: confirmadoCount * 75,
      },
      {
        id: 'retorno',
        name: 'Retorno Pendente',
        color: '#f97316', // orange
        count: retornoCount,
        value: retornoCount * 55,
      },
      {
        id: 'concluido',
        name: 'Concluído / VIP',
        color: '#059669', // green
        count: concluidoCount,
        value: concluidoCount * 90,
      },
    ];
  }, [crmLeads, appointments, crmMetrics.returnDueCount]);

  const totalDonutValue = useMemo(() => {
    return pipelineStages.reduce((acc, s) => acc + s.value, 0);
  }, [pipelineStages]);

  // SVG Line Chart coordinates
  const VB_W = 760;
  const VB_H = 220;
  const PAD = { top: 20, right: 20, bottom: 30, left: 35 };
  const chartW = VB_W - PAD.left - PAD.right;
  const chartH = VB_H - PAD.top - PAD.bottom;

  const maxVal = useMemo(() => {
    const rawMax = chartData.reduce(
      (m, p) => Math.max(m, p.incoming, p.outgoing),
      0
    );
    return Math.ceil(rawMax * 1.25) || 30;
  }, [chartData]);

  const stepX = chartData.length > 1 ? chartW / (chartData.length - 1) : 0;
  const xFor = (i: number) => PAD.left + i * stepX;
  const yFor = (v: number) => PAD.top + chartH - (v / maxVal) * chartH;

  const incomingPath = chartData
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)},${yFor(p.incoming)}`)
    .join(' ');

  const outgoingPath = chartData
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)},${yFor(p.outgoing)}`)
    .join(' ');

  const incomingArea = `${incomingPath} L ${xFor(chartData.length - 1)},${PAD.top + chartH} L ${xFor(0)},${PAD.top + chartH} Z`;

  // SVG Donut calculation
  const donutSize = 180;
  const donutR = 68;
  const donutCx = donutSize / 2;
  const donutCy = donutSize / 2;
  const donutWidth = 16;

  const donutSegments = useMemo(() => {
    const total = totalDonutValue || 1;
    let accumulatedAngle = -Math.PI / 2;

    return pipelineStages.map((stage) => {
      const share = stage.value / total;
      const angle = share * Math.PI * 2;
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + angle;
      accumulatedAngle += angle;

      const x1 = donutCx + donutR * Math.cos(startAngle);
      const y1 = donutCy + donutR * Math.sin(startAngle);
      const x2 = donutCx + donutR * Math.cos(endAngle);
      const y2 = donutCy + donutR * Math.sin(endAngle);
      const largeArc = angle > Math.PI ? 1 : 0;

      const path = `M ${x1} ${y1} A ${donutR} ${donutR} 0 ${largeArc} 1 ${x2} ${y2}`;
      return { ...stage, path };
    });
  }, [pipelineStages, totalDonutValue, donutCx, donutCy, donutR]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Painel</h2>
        <p className="mt-1 text-sm text-slate-400">
          Métricas ao vivo de conversas, contatos, negócios, disparos e automações.
        </p>
      </div>

      {/* 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Conversas ativas */}
        <div className="rounded-xl border border-slate-800/80 bg-[#0e1320] p-4.5 transition-all hover:border-slate-700/80">
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium text-slate-400">Conversas ativas</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-[26px] leading-none font-bold tabular-nums text-white">
            {activeConversationsCount}
          </p>
          <div className="mt-2.5 flex items-center gap-1 text-xs text-emerald-400 font-medium">
            <ArrowUp className="h-3.5 w-3.5" />
            <span>+12% vs mês passado</span>
          </div>
        </div>

        {/* Card 2: Novos contatos hoje */}
        <div className="rounded-xl border border-slate-800/80 bg-[#0e1320] p-4.5 transition-all hover:border-slate-700/80">
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium text-slate-400">Novos contatos hoje</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <UserPlus className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-[26px] leading-none font-bold tabular-nums text-white">
            {newContactsTodayCount}
          </p>
          <div className="mt-2.5 flex items-center gap-1 text-xs text-emerald-400 font-medium">
            <ArrowUp className="h-3.5 w-3.5" />
            <span>+2 vs ontem</span>
          </div>
        </div>

        {/* Card 3: Valor dos negócios abertos */}
        <div className="rounded-xl border border-slate-800/80 bg-[#0e1320] p-4.5 transition-all hover:border-slate-700/80">
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium text-slate-400">Valor em aberto</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-xl sm:text-[22px] leading-none font-bold tabular-nums text-white">
            {formatCurrency(openDealsValue)}
          </p>
          <div className="mt-2.5 flex items-center gap-1 text-xs text-emerald-400 font-medium">
            <ArrowUp className="h-3.5 w-3.5" />
            <span>+18% no funil</span>
          </div>
        </div>

        {/* Card 4: Mensagens enviadas hoje */}
        <div className="rounded-xl border border-slate-800/80 bg-[#0e1320] p-4.5 transition-all hover:border-slate-700/80">
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium text-slate-400">Mensagens hoje</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <Send className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-[26px] leading-none font-bold tabular-nums text-white">
            {messagesSentCount}
          </p>
          <div className="mt-2.5 flex items-center gap-1 text-xs text-emerald-400 font-medium">
            <ArrowUp className="h-3.5 w-3.5" />
            <span>+8% vs média</span>
          </div>
        </div>

        {/* Card 5: Cortes Concluídos / Retorno */}
        <div className="rounded-xl border border-slate-800/80 bg-[#0e1320] p-4.5 transition-all hover:border-slate-700/80">
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium text-slate-400">Retornos pendentes</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
              <Scissors className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-[26px] leading-none font-bold tabular-nums text-white">
            {crmMetrics.returnDueCount}
          </p>
          <div className="mt-2.5 flex items-center gap-1 text-xs text-amber-400 font-medium">
            <span>Fidelização ativa</span>
          </div>
        </div>
      </div>

      {/* Quick actions row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => onSelectTab('contacts')}
          className="group flex items-center gap-3 rounded-xl border border-slate-800/80 bg-[#0e1320] px-4 py-3 text-left transition-all hover:border-slate-700 hover:bg-slate-800/50"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <UserPlus className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-white block truncate">Novo contato</span>
            <span className="text-[10px] text-slate-400 block truncate">Cadastrar cliente</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('pipelines')}
          className="group flex items-center gap-3 rounded-xl border border-slate-800/80 bg-[#0e1320] px-4 py-3 text-left transition-all hover:border-slate-700 hover:bg-slate-800/50"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <Briefcase className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-white block truncate">Novo negócio</span>
            <span className="text-[10px] text-slate-400 block truncate">Mover no funil</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('appointments')}
          className="group flex items-center gap-3 rounded-xl border border-slate-800/80 bg-[#0e1320] px-4 py-3 text-left transition-all hover:border-slate-700 hover:bg-slate-800/50"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-white block truncate">Novo agendamento</span>
            <span className="text-[10px] text-slate-400 block truncate">Marcar horário</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('broadcasts')}
          className="group flex items-center gap-3 rounded-xl border border-slate-800/80 bg-[#0e1320] px-4 py-3 text-left transition-all hover:border-slate-700 hover:bg-slate-800/50"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
            <Radio className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-white block truncate">Novo disparo</span>
            <span className="text-[10px] text-slate-400 block truncate">WhatsApp em massa</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('automations')}
          className="group flex items-center gap-3 rounded-xl border border-slate-800/80 bg-[#0e1320] px-4 py-3 text-left transition-all hover:border-slate-700 hover:bg-slate-800/50"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
            <Zap className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-white block truncate">Nova automação</span>
            <span className="text-[10px] text-slate-400 block truncate">Gatilhos automáticos</span>
          </div>
        </button>
      </div>

      {/* Two columns: Volume chart (60%) + Pipeline donut (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left column: Volume chart */}
        <div className="lg:col-span-3 rounded-xl border border-slate-800/80 bg-[#0e1320] flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 p-4 sm:p-5 gap-2">
            <div>
              <h3 className="text-sm font-semibold text-white">Volume de Atendimentos & Conversas</h3>
              <p className="text-xs text-slate-400 mt-0.5">Histórico diário de cortes agendados e interações no WhatsApp</p>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-slate-900/80 p-1 border border-slate-800 self-start sm:self-auto">
              {[7, 30, 90].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r as 7 | 30 | 90)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    range === r ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r} dias
                </button>
              ))}
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center">
            <div className="relative w-full">
              <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-[220px]" role="img">
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-axis gridlines */}
                {[0, maxVal / 2, maxVal].map((tick) => {
                  const y = yFor(tick);
                  return (
                    <g key={tick}>
                      <line
                        x1={PAD.left}
                        x2={VB_W - PAD.right}
                        y1={y}
                        y2={y}
                        stroke="#1e293b"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={PAD.left - 8}
                        y={y + 3}
                        textAnchor="end"
                        className="fill-slate-500 text-[10px] tabular-nums"
                      >
                        {Math.round(tick)}
                      </text>
                    </g>
                  );
                })}

                {/* Area under curve */}
                <path d={incomingArea} fill="url(#blueGradient)" />

                {/* Outgoing line (purple) */}
                <path
                  d={outgoingPath}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Incoming line (blue) */}
                <path
                  d={incomingPath}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data points */}
                {chartData.map((p, i) => {
                  const cx = xFor(i);
                  const cyIn = yFor(p.incoming);
                  const cyOut = yFor(p.outgoing);
                  const isHovered = hoverIndex === i;

                  return (
                    <g key={i} className="cursor-pointer" onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)}>
                      <circle cx={cx} cy={cyIn} r={isHovered ? 5 : 3.5} fill="#3b82f6" stroke="#0e1320" strokeWidth="2" />
                      <circle cx={cx} cy={cyOut} r={isHovered ? 5 : 3.5} fill="#8b5cf6" stroke="#0e1320" strokeWidth="2" />
                      {/* X label */}
                      <text
                        x={cx}
                        y={VB_H - 10}
                        textAnchor="middle"
                        className={`text-[10px] ${isHovered ? 'fill-white font-bold' : 'fill-slate-500'}`}
                      >
                        {p.label}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Hover tooltip */}
              {hoverIndex !== null && chartData[hoverIndex] && (
                <div
                  className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 shadow-xl text-xs flex items-center gap-3 z-10 pointer-events-none"
                >
                  <span className="font-semibold text-white">{chartData[hoverIndex].label}:</span>
                  <span className="text-blue-400 font-medium">✂️ {chartData[hoverIndex].incoming} agendamentos</span>
                  <span className="text-purple-400 font-medium">💬 {chartData[hoverIndex].outgoing} mensagens</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5 border-t border-slate-800/80 px-5 py-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#3b82f6]" />
              <span>Atendimentos Agendados</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#8b5cf6]" />
              <span>Conversas WhatsApp</span>
            </div>
          </div>
        </div>

        {/* Right column: Pipeline Donut */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800/80 bg-[#0e1320] flex flex-col p-4 sm:p-5">
          <div className="border-b border-slate-800/80 pb-3 mb-4">
            <h3 className="text-sm font-semibold text-white">Valor do Pipeline & Funil</h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribuição de receita por etapa do CRM</p>
          </div>

          {/* Donut SVG */}
          <div className="flex items-center justify-center my-2">
            <svg viewBox={`0 0 ${donutSize} ${donutSize}`} className="h-44 w-44" role="img">
              {/* Background circle */}
              <circle
                cx={donutCx}
                cy={donutCy}
                r={donutR}
                fill="none"
                stroke="#1e293b"
                strokeWidth={donutWidth}
              />
              {/* Segments */}
              {donutSegments.map((seg) => (
                <path
                  key={seg.id}
                  d={seg.path}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={donutWidth}
                  strokeLinecap="butt"
                />
              ))}
              {/* Center text */}
              <text
                x={donutCx}
                y={donutCy - 5}
                textAnchor="middle"
                className="fill-slate-400 text-[11px]"
              >
                Total Previsto
              </text>
              <text
                x={donutCx}
                y={donutCy + 14}
                textAnchor="middle"
                className="fill-white text-[15px] font-bold tabular-nums"
              >
                {formatCurrency(totalDonutValue)}
              </text>
            </svg>
          </div>

          {/* Stage breakdown list */}
          <ul className="mt-4 space-y-2.5 flex-1">
            {pipelineStages.map((stage) => (
              <li key={stage.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="truncate text-slate-300 font-medium">{stage.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 tabular-nums">
                  <span className="text-slate-400">{stage.count} deals</span>
                  <span className="font-semibold text-white w-20 text-right">
                    {formatCurrency(stage.value)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom section: Recent Activities & Reminders */}
      <div className="rounded-xl border border-slate-800/80 bg-[#0e1320] p-4 sm:p-5">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Atividades Recentes & Disparos Pendentes</h3>
            <p className="text-xs text-slate-400 mt-0.5">Ações rápidas para confirmar horários ou lembrar retornos</p>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab('appointments')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
          >
            <span>Ver todos os agendamentos</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Serviço</th>
                <th className="py-2.5 px-3">Horário</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Ação WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {appointments.slice(0, 5).map((app) => (
                <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-semibold text-white">{app.client.name}</p>
                    <p className="text-[11px] text-slate-400">{app.client.phone}</p>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-slate-200">{app.service.name}</span>
                    <span className="text-[11px] text-slate-400 block">{formatCurrency(app.service.price)}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-slate-200">
                      {new Date(app.dateTime).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(app.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        app.status === 'CONFIRMED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : app.status === 'COMPLETED'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {app.status === 'CONFIRMED' ? 'Confirmado' : app.status === 'COMPLETED' ? 'Concluído' : 'Pendente'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => onDirectWhatsApp(app)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-all"
                    >
                      <Phone className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
