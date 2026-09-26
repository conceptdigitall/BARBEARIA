'use client';

import {
  Radio,
  Users,
  FileText,
  DollarSign,
  Tag,
  Palette,
  ChevronRight,
  Bot,
  Crown,
  Sparkles,
  Clock,
} from 'lucide-react';
import type { SettingsSection } from './SettingsRail';

interface SettingsOverviewPanelProps {
  onSelect: (section: SettingsSection) => void;
  isDark: boolean;
  waConnected: boolean;
  aiActive: boolean;
  whatsappPhone: string;
}

export function SettingsOverviewPanel({
  onSelect,
  isDark,
  waConnected,
  aiActive,
  whatsappPhone,
}: SettingsOverviewPanelProps) {
  const cardBorder = isDark
    ? 'border-slate-800 bg-slate-900/60 hover:border-[#C5A880]/50 hover:bg-slate-900/90'
    : 'border-slate-200/90 bg-white hover:border-[#C5A880]/50 hover:bg-slate-50/80 shadow-xs';

  return (
    <div className="space-y-5 animate-in fade-in-50 duration-200">
      {/* 1. Card Superior: Perfil do Administrador */}
      <div
        className={`flex items-center justify-between rounded-2xl border p-5 shadow-xs transition-colors ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#C5A880] to-[#D4AF37] text-black font-black text-xl shadow-md border border-[#C5A880]/40">
            K
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Kawe (Alemão)
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#C5A880]/40 bg-[#C5A880]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#C5A880]">
                <Crown className="w-3 h-3 text-[#C5A880]" />
                PROPRIETÁRIO
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">alemao@barbearia.com</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelect('profile')}
          className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#C5A880] hover:underline"
        >
          Editar perfil
        </button>
      </div>

      {/* 2. Grid de Cards de Configuração (Réplica Pixel a Pixel do CRM Original) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">

        {/* Card: Horários & Grade de Expediente */}
        <button
          type="button"
          onClick={() => onSelect('schedules')}
          className={`flex items-start justify-between rounded-xl border p-4 text-left transition-all ${cardBorder}`}
        >
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C5A880]/15 text-[#C5A880]">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Horários & Grade
              </h4>
              <div className="mt-1 flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Sincronizado c/ Site
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[160px]">
                Expediente, folgas e almoço
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
        </button>

        {/* Card: WhatsApp */}
        <button
          type="button"
          onClick={() => onSelect('whatsapp')}
          className={`flex items-start justify-between rounded-xl border p-4 text-left transition-all ${cardBorder}`}
        >
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                WhatsApp
              </h4>
              <div className="mt-1 flex items-center gap-1.5 text-xs">
                <span
                  className={`h-2 w-2 rounded-full ${
                    waConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span className={waConnected ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-amber-600'}>
                  {waConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[160px]">
                {whatsappPhone || '+55 (13) 97424-9209'}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
        </button>

        {/* Card: Membros da equipe */}
        <button
          type="button"
          onClick={() => onSelect('members')}
          className={`flex items-start justify-between rounded-xl border p-4 text-left transition-all ${cardBorder}`}
        >
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C5A880]/15 text-[#C5A880]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Membros da equipe
              </h4>
              <p className="mt-1 text-xs text-slate-500">1 membro</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Kawe Alemão</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
        </button>

        {/* Card: Modelos de Mensagem */}
        <button
          type="button"
          onClick={() => onSelect('templates')}
          className={`flex items-start justify-between rounded-xl border p-4 text-left transition-all ${cardBorder}`}
        >
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Modelos
              </h4>
              <p className="mt-1 text-xs text-slate-500">4 modelos</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Confirmação, Lembrete, Combo</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
        </button>

        {/* Card: Negócios e moeda */}
        <button
          type="button"
          onClick={() => onSelect('deals')}
          className={`flex items-start justify-between rounded-xl border p-4 text-left transition-all ${cardBorder}`}
        >
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Negócios e moeda
              </h4>
              <p className="mt-1 text-xs text-slate-500">BRL — Brazilian Real</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Moeda padrão dos serviços</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
        </button>

        {/* Card: Agente de IA */}
        <button
          type="button"
          onClick={() => onSelect('ai')}
          className={`flex items-start justify-between rounded-xl border p-4 text-left transition-all ${cardBorder}`}
        >
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Agentes de IA
              </h4>
              <div className="mt-1 flex items-center gap-1.5 text-xs">
                <span
                  className={`h-2 w-2 rounded-full ${
                    aiActive ? 'bg-purple-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                <span className={aiActive ? 'text-purple-600 dark:text-purple-400 font-semibold' : 'text-slate-500'}>
                  {aiActive ? 'Ativo (GPT-4o)' : 'Desativado'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Recepção & Tabela de Preços</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
        </button>

        {/* Card: Aparência & CMS */}
        <button
          type="button"
          onClick={() => onSelect('cms')}
          className={`flex items-start justify-between rounded-xl border p-4 text-left transition-all ${cardBorder}`}
        >
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-pink-600">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Aparência & CMS
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                modo {isDark ? 'Dark' : 'Light'} · Dourado 777
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Hero, Instagram e Endereço</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
        </button>

      </div>
    </div>
  );
}
