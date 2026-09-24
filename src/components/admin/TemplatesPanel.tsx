'use client';

import React, { useState } from 'react';
import { FileText, Copy, Check, MessageSquare } from 'lucide-react';

interface TemplatesPanelProps {
  isDark: boolean;
}

export function TemplatesPanel({ isDark }: TemplatesPanelProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const templates = [
    {
      id: 'confirmacao_agendamento',
      name: 'Confirmação de Agendamento',
      category: 'UTILIDADE',
      text: 'Fala {{1}}! Confirmando seu agendamento de {{2}} para hoje às {{3}} na Barbearia do Alemão 777. Endereço: Rua Espanha, 360 - Jardim Casqueiro, Cubatão. Qualquer imprevisto nos avise por aqui!',
    },
    {
      id: 'lembrete_24h_antes',
      name: 'Lembrete de Véspera (24h Antes)',
      category: 'UTILIDADE',
      text: 'E aí {{1}}! Tudo certo? Passando para lembrar do seu horário de {{2}} amanhã às {{3}} com o Alemão. Te esperamos na Rua Espanha, 360!',
    },
    {
      id: 'lembrete_retorno',
      name: 'Lembrete de Retorno (15-30 dias)',
      category: 'MARKETING',
      text: 'Fala {{1}}! Já faz {{2}} dias desde seu último corte aqui na Barbearia do Alemão 777. Que tal mantermos o visual alinhado essa semana? Responda essa mensagem para agendar seu horário!',
    },
    {
      id: 'combo_promocional_90',
      name: 'Combo Especial: Corte + Barba + Sobrancelha (R$ 90)',
      category: 'MARKETING',
      text: 'Fala {{1}}! Conhece o nosso Combo Completo? Corte degradê ou clássico + Barboterapia relaxante com toalha quente + Design de sobrancelha na navalha por apenas R$ 90,00! Quer garantir seu horário essa semana?',
    },
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div>
        <h2 className={`text-xl font-bold font-serif ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Modelos de Mensagem WhatsApp
        </h2>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Modelos formatados para notificações e campanhas da Barbearia do Alemão 777.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className={`rounded-xl border p-5 space-y-3 flex flex-col justify-between ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#C5A880]/15 text-[#C5A880] uppercase tracking-wider">
                  {tpl.category}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{tpl.id}</span>
              </div>
              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {tpl.name}
              </h4>
              <p
                className={`text-xs mt-2 p-3 rounded-lg border leading-relaxed font-sans ${
                  isDark ? 'bg-slate-800/60 border-slate-700/60 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {tpl.text}
              </p>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => handleCopy(tpl.id, tpl.text)}
                className="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {copiedId === tpl.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedId === tpl.id ? 'Texto Copiado!' : 'Copiar Texto'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
