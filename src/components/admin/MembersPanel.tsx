'use client';

import React from 'react';
import { Users, Crown, Scissors, UserPlus, CheckCircle2 } from 'lucide-react';

interface MembersPanelProps {
  isDark: boolean;
}

export function MembersPanel({ isDark }: MembersPanelProps) {
  const members = [
    {
      id: '1',
      name: 'Kawe (Alemão)',
      email: 'alemao@barbearia.com',
      role: 'PROPRIETÁRIO',
      isOwner: true,
      initial: 'K',
      status: 'Ativo',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold font-serif ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Membros da Equipe
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Gerencie os profissionais e barbeiros com acesso ao sistema e à grade de agendamentos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Função de convite por link ou e-mail acionada.')}
          className="px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-black hover:brightness-105 transition-all shadow-xs flex items-center gap-1.5"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Convidar Membro
        </button>
      </div>

      <div
        className={`rounded-xl border overflow-hidden shadow-xs ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <table className="w-full text-left text-xs">
          <thead
            className={`border-b ${
              isDark ? 'border-slate-800 bg-slate-800/40 text-slate-400' : 'border-slate-100 bg-slate-50 text-slate-500'
            }`}
          >
            <tr>
              <th className="py-3 px-4 font-semibold">Membro</th>
              <th className="py-3 px-4 font-semibold">Cargo</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#C5A880] to-[#D4AF37] text-black font-bold text-xs shrink-0">
                      {member.initial}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{member.name}</div>
                      <div className="text-[11px] text-slate-400">{member.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      member.isOwner
                        ? 'bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30'
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {member.isOwner ? <Crown className="w-3 h-3" /> : <Scissors className="w-3 h-3" />}
                    {member.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {member.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => alert(`Configurações de ${member.name}`)}
                    className="text-slate-400 hover:text-[#C5A880] text-xs font-semibold"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
