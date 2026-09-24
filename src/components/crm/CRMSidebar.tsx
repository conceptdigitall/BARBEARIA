'use client';

import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Bell,
  Users,
  GitBranch,
  CalendarDays,
  Radio,
  Zap,
  BarChart3,
  Clock,
  Settings,
  Crown,
  LogOut,
  X
} from 'lucide-react';
import { ConceptLogo } from './ConceptLogo';

export type CRMTabId =
  | 'painel'
  | 'inbox'
  | 'notifications'
  | 'contacts'
  | 'pipelines'
  | 'appointments'
  | 'broadcasts'
  | 'automations'
  | 'reports'
  | 'availability'
  | 'settings';

interface CRMSidebarProps {
  activeTab: CRMTabId;
  onSelectTab: (tab: CRMTabId) => void;
  open: boolean;
  onClose: () => void;
  notificationCount: number;
  unreadInboxCount?: number;
  returnDueCount?: number;
}

export function CRMSidebar({
  activeTab,
  onSelectTab,
  open,
  onClose,
  notificationCount,
  unreadInboxCount = 2,
  returnDueCount = 0,
}: CRMSidebarProps) {
  const primaryNavItems: {
    id: CRMTabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { id: 'painel', label: 'Painel', icon: LayoutDashboard },
    {
      id: 'inbox',
      label: 'Caixa de entrada',
      icon: MessageSquare,
      badge: unreadInboxCount > 0 ? unreadInboxCount : undefined,
      badgeColor: 'bg-blue-500 text-white',
    },
    {
      id: 'notifications',
      label: 'Notificações',
      icon: Bell,
      badge: notificationCount > 0 ? notificationCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'contacts',
      label: 'Contatos',
      icon: Users,
      badge: returnDueCount > 0 ? returnDueCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    },
    { id: 'pipelines', label: 'Pipelines', icon: GitBranch },
    { id: 'appointments', label: 'Agendamentos', icon: CalendarDays },
    { id: 'broadcasts', label: 'Disparos', icon: Radio },
    { id: 'automations', label: 'Automações', icon: Zap },
  ];

  const secondaryNavItems: {
    id: CRMTabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'availability', label: 'Escala Horária', icon: Clock },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r border-slate-800/80 bg-[#0c121e] text-slate-100 transition-transform duration-200 ease-out lg:static lg:z-0 lg:w-64 lg:translate-x-0 lg:transition-none ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo row */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 px-4">
          <ConceptLogo subtitle="Barbearia 777" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-left ${
                  isActive
                    ? 'bg-[#0624C7] text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                      item.badgeColor || 'bg-blue-600 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="my-3 border-t border-slate-800/80" />

          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-[#0624C7] text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User profile strip */}
        <div className="shrink-0 border-t border-slate-800/80 p-3 bg-[#0a0f1a]/80">
          <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold text-xs shrink-0">
              AL
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">
                Alemão 777
              </p>
              <p className="truncate text-[11px] text-slate-400">
                admin@barbearia.com
              </p>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-[#FCE026]/40 bg-[#FCE026]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#FCE026]">
              <Crown className="w-2.5 h-2.5" />
              PROPRIETÁRIO
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
