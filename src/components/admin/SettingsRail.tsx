'use client';

import React from 'react';
import {
  LayoutDashboard,
  Radio,
  Bot,
  FileText,
  MessageSquare,
  Tag,
  DollarSign,
  Users,
  Settings as SettingsIcon,
  Palette,
  Shield,
  User,
  Sliders,
  Sparkles,
  Clock,
} from 'lucide-react';

export type SettingsSection =
  | 'overview'
  | 'schedules'
  | 'whatsapp'
  | 'ai'
  | 'cms'
  | 'members'
  | 'templates'
  | 'quick-replies'
  | 'fields'
  | 'deals'
  | 'appearance'
  | 'profile'
  | 'security';

interface SettingsRailProps {
  active: SettingsSection;
  onSelect: (section: SettingsSection) => void;
  isDark: boolean;
  waConnected: boolean;
  aiActive: boolean;
}

export function SettingsRail({
  active,
  onSelect,
  isDark,
  waConnected,
  aiActive,
}: SettingsRailProps) {
  const itemClass = (section: SettingsSection) => {
    const isActive = active === section;
    if (isActive) {
      return 'bg-gradient-to-r from-[#C5A880]/20 to-[#D4AF37]/15 text-[#C5A880] dark:text-[#D4AF37] font-bold border-l-2 border-[#C5A880]';
    }
    return isDark
      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100';
  };

  return (
    <nav className="space-y-6 text-xs w-full lg:w-56 shrink-0">
      {/* Visão Geral */}
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => onSelect('overview')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${itemClass(
            'overview'
          )}`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>Visão geral</span>
        </button>
      </div>

      {/* Seção CONTA */}
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Conta
        </p>
        <button
          type="button"
          onClick={() => onSelect('profile')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${itemClass(
            'profile'
          )}`}
        >
          <User className="w-4 h-4 shrink-0" />
          <span>Seu perfil</span>
        </button>
        <button
          type="button"
          onClick={() => onSelect('security')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${itemClass(
            'security'
          )}`}
        >
          <Shield className="w-4 h-4 shrink-0" />
          <span>Login e segurança</span>
        </button>
        <button
          type="button"
          onClick={() => onSelect('appearance')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${itemClass(
            'appearance'
          )}`}
        >
          <div className="flex items-center gap-2.5">
            <Palette className="w-4 h-4 shrink-0" />
            <span>Aparência</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-semibold">
            {isDark ? 'Dark' : 'Light'}
          </span>
        </button>
      </div>

      {/* Seção ESPAÇO DE TRABALHO */}
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Espaço de Trabalho
        </p>

        {/* Horários & Grade de Expediente */}
        <button
          type="button"
          onClick={() => onSelect('schedules')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${itemClass(
            'schedules'
          )}`}
        >
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 shrink-0" />
            <span>Horários & Grade</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-500 font-bold uppercase tracking-wider">
            Ativo
          </span>
        </button>
        
        {/* WhatsApp Conexão */}
        <button
          type="button"
          onClick={() => onSelect('whatsapp')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${itemClass(
            'whatsapp'
          )}`}
        >
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 shrink-0" />
            <span>WhatsApp</span>
          </div>
          <span className="flex h-2 w-2 relative">
            {waConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                waConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
        </button>

        {/* Agentes de IA */}
        <button
          type="button"
          onClick={() => onSelect('ai')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${itemClass(
            'ai'
          )}`}
        >
          <div className="flex items-center gap-2.5">
            <Bot className="w-4 h-4 shrink-0" />
            <span>Agentes de IA</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">
            {aiActive ? 'Ativo' : 'Off'}
          </span>
        </button>

        {/* Modelos */}
        <button
          type="button"
          onClick={() => onSelect('templates')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${itemClass(
            'templates'
          )}`}
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 shrink-0" />
            <span>Modelos</span>
          </div>
          <span className="text-[10px] opacity-60">4</span>
        </button>

        {/* Respostas rápidas */}
        <button
          type="button"
          onClick={() => onSelect('quick-replies')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${itemClass(
            'quick-replies'
          )}`}
        >
          <MessageSquare className="w-4 h-4 shrink-0" />
          <span>Respostas rápidas</span>
        </button>

        {/* Campos e tags */}
        <button
          type="button"
          onClick={() => onSelect('fields')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${itemClass(
            'fields'
          )}`}
        >
          <Tag className="w-4 h-4 shrink-0" />
          <span>Campos e tags</span>
        </button>

        {/* Negócios e moeda */}
        <button
          type="button"
          onClick={() => onSelect('deals')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${itemClass(
            'deals'
          )}`}
        >
          <div className="flex items-center gap-2.5">
            <DollarSign className="w-4 h-4 shrink-0" />
            <span>Negócios e moeda</span>
          </div>
          <span className="text-[10px] font-bold text-[#C5A880]">BRL</span>
        </button>

        {/* Membros da equipe */}
        <button
          type="button"
          onClick={() => onSelect('members')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${itemClass(
            'members'
          )}`}
        >
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 shrink-0" />
            <span>Membros da equipe</span>
          </div>
          <span className="text-[10px] opacity-60">2</span>
        </button>

        {/* CMS Barbearia */}
        <button
          type="button"
          onClick={() => onSelect('cms')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${itemClass(
            'cms'
          )}`}
        >
          <Sliders className="w-4 h-4 shrink-0" />
          <span>CMS Barbearia</span>
        </button>
      </div>
    </nav>
  );
}
