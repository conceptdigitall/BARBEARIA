'use client';

import React, { useState } from 'react';
import {
  Zap,
  Clock,
  Scissors,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Play,
  Pause,
  ArrowRight,
  TrendingUp,
  Settings2
} from 'lucide-react';

interface AutomationWorkflow {
  id: string;
  name: string;
  trigger: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  active: boolean;
  executionsCount: number;
  openRate: string;
  template: string;
}

export function AutomationsView() {
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([
    {
      id: 'date_approach',
      name: 'Lembrete de Agendamento Próximo (24h antes)',
      trigger: '24 horas antes do horário marcado',
      description: 'Envia um lembrete no WhatsApp com data, horário e serviço para confirmar a presença do cliente e reduzir faltas.',
      icon: Clock,
      iconColor: 'bg-blue-500/10 text-blue-400',
      active: true,
      executionsCount: 142,
      openRate: '99.2%',
      template: 'Olá, *{Nome}*! 💈 Passando para lembrar do seu corte na Barbearia do Alemão 777 agendado para o dia *{Data}* às *{Horário}* ({Serviço}). Te esperamos no horário combinado! Podemos confirmar sua presença? ✂️🇩🇪',
    },
    {
      id: 'return_reminder',
      name: 'Lembrete de Retorno (Fidelização 20 dias)',
      trigger: '20 dias após o último corte sem novo agendamento',
      description: 'Identifica clientes cujo intervalo ideal de corte já passou e convida-os para renovar o visual para a semana.',
      icon: Scissors,
      iconColor: 'bg-amber-500/10 text-amber-400',
      active: true,
      executionsCount: 86,
      openRate: '41.8% de retorno',
      template: 'Fala, *{Nome}*! 💈 Já se passaram *{Dias} dias* desde o seu último corte! Que tal manter o degradê e o visual de respeito alinhados esta semana? Garanta seu horário online ou me avise aqui o melhor dia! ✂️🇩🇪',
    },
    {
      id: 'welcome_lead',
      name: 'Boas-Vindas para Novos Clientes',
      trigger: 'Imediatamente após o 1º agendamento realizado',
      description: 'Apresenta a Barbearia do Alemão 777, envia localização e informações de estacionamento e comodidades.',
      icon: Sparkles,
      iconColor: 'bg-purple-500/10 text-purple-400',
      active: true,
      executionsCount: 29,
      openRate: '98.5%',
      template: 'Fala, *{Nome}*! Seja muito bem-vindo à Barbearia do Alemão 777! 🇩🇪 Estamos localizados na Rua Espanha, 360 - Jd. Casqueiro. Temos cerveja gelada, sinuca e ambiente climatizado esperando por você!',
    },
    {
      id: 'feedback_review',
      name: 'Pesquisa de Satisfação & Avaliação Google',
      trigger: '2 horas após o status do corte ser marcado como "Concluído"',
      description: 'Pede feedback do atendimento e convida clientes satisfeitos a deixarem 5 estrelas na página do Google.',
      icon: CheckCircle2,
      iconColor: 'bg-emerald-500/10 text-emerald-400',
      active: true,
      executionsCount: 118,
      openRate: '4.9 ★ média',
      template: 'Fala, *{Nome}*! Valeu demais pela confiança no seu corte hoje! Ficou 100% satisfeito com o resultado? Se puder nos avaliar com 5 estrelas no Google, nos ajuda demais! ✂️💈',
    },
  ]);

  const toggleWorkflow = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, active: !w.active } : w))
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Automações & Gatilhos</h2>
        <p className="mt-1 text-sm text-slate-400">
          Workflows inteligentes para fidelizar clientes, reduzir faltas e manter a agenda cheia via WhatsApp.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-slate-800/80 bg-[#0e1320] p-4">
          <p className="text-xs text-slate-400 font-medium">Workflows Ativos</p>
          <p className="text-2xl font-bold text-white mt-1">4 / 4</p>
          <span className="text-[11px] text-emerald-400 font-medium mt-1 block">100% operacionais</span>
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-[#0e1320] p-4">
          <p className="text-xs text-slate-400 font-medium">Disparos este Mês</p>
          <p className="text-2xl font-bold text-white mt-1">375</p>
          <span className="text-[11px] text-blue-400 font-medium mt-1 block">+22% vs mês anterior</span>
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-[#0e1320] p-4">
          <p className="text-xs text-slate-400 font-medium">Taxa de Entrega</p>
          <p className="text-2xl font-bold text-white mt-1">99.4%</p>
          <span className="text-[11px] text-emerald-400 font-medium mt-1 block">WhatsApp API Conectada</span>
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-[#0e1320] p-4">
          <p className="text-xs text-slate-400 font-medium">Retorno Gerado</p>
          <p className="text-2xl font-bold text-white mt-1">41.8%</p>
          <span className="text-[11px] text-amber-400 font-medium mt-1 block">Cortes recuperados</span>
        </div>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {workflows.map((w) => {
          const Icon = w.icon;
          return (
            <div
              key={w.id}
              className={`rounded-xl border transition-all p-5 ${
                w.active
                  ? 'border-slate-800/80 bg-[#0e1320]'
                  : 'border-slate-800/40 bg-slate-900/30 opacity-70'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/70 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${w.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{w.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        Gatilho: {w.trigger}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{w.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Performance</span>
                    <span className="text-xs font-semibold text-slate-300">
                      {w.executionsCount} disparos • {w.openRate}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleWorkflow(w.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      w.active
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {w.active ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pausar</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Ativar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Message template preview */}
              <div className="mt-4 bg-slate-900/80 border border-slate-800 rounded-lg p-3">
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-blue-400" />
                  Template de Mensagem WhatsApp:
                </p>
                <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {w.template}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
