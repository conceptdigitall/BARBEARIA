'use client';

import React, { useState } from 'react';
import {
  Search,
  Send,
  Phone,
  CheckCheck,
  Sparkles,
  Scissors,
  Calendar,
  Clock,
  ExternalLink
} from 'lucide-react';
import type { CRMLead } from '../AdminDashboard';

interface InboxViewProps {
  crmLeads: CRMLead[];
  onSendReturnReminder: (lead: CRMLead) => void;
  onSendDateApproachNotification: (lead: CRMLead) => void;
}

export function InboxView({
  crmLeads,
  onSendReturnReminder,
  onSendDateApproachNotification,
}: InboxViewProps) {
  const [search, setSearch] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(
    crmLeads[0]?.id || null
  );
  const [customReply, setCustomReply] = useState('');

  const filteredLeads = crmLeads.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.phone.includes(search)
  );

  const activeLead = crmLeads.find((l) => l.id === selectedLeadId) || crmLeads[0];

  const handleSendCustomWhatsApp = () => {
    if (!activeLead) return;
    const cleanPhone = activeLead.phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const text = customReply.trim() || `Olá, *${activeLead.name}*! 💈 Barbearia do Alemão 777 por aqui. Como posso te ajudar hoje? ✂️`;
    const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setCustomReply('');
  };

  const handleSelectQuickReply = (text: string) => {
    setCustomReply(text);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Caixa de Entrada</h2>
        <p className="mt-1 text-sm text-slate-400">
          Gerenciamento e comunicação direta via WhatsApp com seus clientes e leads.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 rounded-xl border border-slate-800/80 bg-[#0e1320] overflow-hidden min-h-[580px]">
        {/* Left column: Conversations list */}
        <div className="lg:col-span-4 border-r border-slate-800/80 flex flex-col bg-[#0a0f1a]">
          {/* Search bar */}
          <div className="p-3 border-b border-slate-800/80">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar cliente ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Conversations scroll area */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
            {filteredLeads.map((lead) => {
              const isSelected = lead.id === activeLead?.id;
              return (
                <button
                  key={lead.id}
                  type="button"
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={`w-full p-3 text-left transition-colors flex items-start gap-3 ${
                    isSelected ? 'bg-blue-600/15 border-l-2 border-blue-500' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                    {lead.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-white truncate">{lead.name}</p>
                      <span className="text-[10px] text-slate-500">Hoje</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {lead.isReturnDue
                        ? '✂️ Retorno recomendado: 20+ dias'
                        : lead.nextAppointment
                        ? `💈 Próximo corte: ${lead.nextAppointment.serviceName}`
                        : 'Cliente ativo na barbearia'}
                    </p>
                    {lead.isReturnDue && (
                      <span className="inline-block mt-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Retorno Pendente
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: Active conversation thread */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-[#0e1320]">
          {activeLead ? (
            <>
              {/* Thread header */}
              <div className="h-16 px-4 border-b border-slate-800/80 flex items-center justify-between bg-[#0a0f1a]/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-700 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                    {activeLead.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{activeLead.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {activeLead.phone}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      LTV: R$ {activeLead.lifetimeValue || 120} • Última visita:{' '}
                      {activeLead.daysSinceLastVisit !== null
                        ? `há ${activeLead.daysSinceLastVisit} dias`
                        : 'Recente'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeLead.isReturnDue && (
                    <button
                      type="button"
                      onClick={() => onSendReturnReminder(activeLead)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30 transition-all"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Disparar Retorno</span>
                    </button>
                  )}
                  {activeLead.nextAppointment && (
                    <button
                      type="button"
                      onClick={() => onSendDateApproachNotification(activeLead)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold hover:bg-blue-500/30 transition-all"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Lembrar Corte</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Chat messages */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[380px]">
                {/* System message */}
                <div className="flex justify-center my-2">
                  <span className="text-[10px] px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                    🔒 Conversa sincronizada com o WhatsApp da Barbearia 777
                  </span>
                </div>

                {/* Message from barber */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-xl rounded-tr-none bg-[#0624C7] text-white p-3 text-xs shadow-md">
                    <p>
                      Fala, <strong>{activeLead.name}</strong>! 💈 Barbearia do Alemão 777 passando por aqui.
                      {activeLead.isReturnDue
                        ? ` Já faz ${activeLead.daysSinceLastVisit || 20} dias desde o seu último corte! Que tal manter o degradê alinhado esta semana?`
                        : activeLead.nextAppointment
                        ? ` Seu corte está agendado para o dia ${new Date(activeLead.nextAppointment.dateTime).toLocaleDateString('pt-BR')} às ${new Date(activeLead.nextAppointment.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`
                        : ' Tudo certo com o seu agendamento!'}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-blue-200">
                      <span>10:45</span>
                      <CheckCheck className="w-3 h-3 text-blue-300" />
                    </div>
                  </div>
                </div>

                {/* Simulated client reply */}
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-xl rounded-tl-none bg-slate-800 border border-slate-700/60 text-slate-100 p-3 text-xs shadow-md">
                    <p>
                      {activeLead.isReturnDue
                        ? 'Opa, Alemão! Verdade cara, já tá na hora de dar aquele trato mesmo. Consegue horário pra sexta à tarde?'
                        : 'Fala, mestre! Perfeito, estarei aí no horário com certeza. Abraço!'}
                    </p>
                    <div className="flex items-center justify-end mt-1 text-[10px] text-slate-400">
                      <span>10:48</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick reply chips */}
              <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/40 flex flex-wrap gap-2 items-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Respostas Rápidas:
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectQuickReply(`Fala, ${activeLead.name}! Sexta-feira às 16:30 tá liberado pra você! Fechamos? ✂️`)}
                  className="px-2.5 py-1 rounded-full text-[11px] bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
                >
                  Confirmar Sexta 16:30
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectQuickReply(`Tudo certo, ${activeLead.name}! Te aguardo no horário combinado. Qualquer imprevisto me avisa por aqui! 💈`)}
                  className="px-2.5 py-1 rounded-full text-[11px] bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
                >
                  Confirmar Presença
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectQuickReply(`Fala, ${activeLead.name}! Que tal garantir seu horário agora pelo link: https://barbearia-do-alemao-gilt.vercel.app`)}
                  className="px-2.5 py-1 rounded-full text-[11px] bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
                >
                  Enviar Link do Site
                </button>
              </div>

              {/* Message composer */}
              <div className="p-3 border-t border-slate-800/80 bg-[#0a0f1a] flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Escreva uma mensagem para enviar via WhatsApp..."
                  value={customReply}
                  onChange={(e) => setCustomReply(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendCustomWhatsApp()}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleSendCustomWhatsApp}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar WhatsApp</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              Selecione uma conversa para visualizar o histórico
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
