'use client';

import React from 'react';
import { Menu, RefreshCw, Moon } from 'lucide-react';

interface CRMHeaderProps {
  title: string;
  onOpenSidebar: () => void;
  onRefresh: () => void;
  loading: boolean;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
}

export function CRMHeader({
  title,
  onOpenSidebar,
  onRefresh,
  loading,
  autoRefresh,
  onToggleAutoRefresh,
}: CRMHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 bg-[#0c121e]/90 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile hamburger + Page Title */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Abrir menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="truncate text-base sm:text-lg font-bold text-white tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right controls: Online badge, auto sync, refresh, theme, avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Status Online */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Sistema Online</span>
        </div>

        {/* Auto sync 30s toggle */}
        <button
          type="button"
          onClick={onToggleAutoRefresh}
          className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
            autoRefresh
              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'
              : 'border-slate-800 text-slate-400 bg-slate-900/60'
          }`}
          title="Alternar sincronização automática a cada 30 segundos"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
          <span>{autoRefresh ? 'Ao Vivo (30s)' : 'Pausado'}</span>
        </button>

        {/* Refresh button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-all disabled:opacity-50"
          title="Atualizar dados agora"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          <span className="hidden sm:inline">Atualizar</span>
        </button>

        {/* Dark mode toggle placeholder */}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400">
          <Moon className="w-4 h-4" />
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-amber-500 flex items-center justify-center text-xs font-bold text-white shadow-xs">
            AL
          </div>
          <span className="hidden lg:inline text-xs font-medium text-slate-200">
            Alemão 777
          </span>
        </div>
      </div>
    </header>
  );
}
