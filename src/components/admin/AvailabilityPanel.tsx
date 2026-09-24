'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  Users,
  Coffee,
  Check,
  ExternalLink,
  ChevronRight,
  Sun,
  ShieldCheck,
} from 'lucide-react';

interface Barber {
  id: string;
  name: string;
  role: string;
}

interface DayAvailability {
  dayOfWeek: number;
  isActive: boolean;
  startTime: string;
  endTime: string;
  breakStart: string | null;
  breakEnd: string | null;
  hasBreak: boolean;
}

const DAYS_ORDER = [
  { dayOfWeek: 1, label: 'Segunda-feira', short: 'Seg' },
  { dayOfWeek: 2, label: 'Terça-feira', short: 'Ter' },
  { dayOfWeek: 3, label: 'Quarta-feira', short: 'Qua' },
  { dayOfWeek: 4, label: 'Quinta-feira', short: 'Qui' },
  { dayOfWeek: 5, label: 'Sexta-feira', short: 'Sex' },
  { dayOfWeek: 6, label: 'Sábado', short: 'Sáb' },
  { dayOfWeek: 0, label: 'Domingo', short: 'Dom' },
];

const TIME_OPTIONS: string[] = [];
for (let h = 7; h <= 22; h++) {
  const hStr = String(h).padStart(2, '0');
  TIME_OPTIONS.push(`${hStr}:00`);
  TIME_OPTIONS.push(`${hStr}:30`);
}

function parseTimeToMin(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function countAvailableSlots(startTime: string, endTime: string, breakStart: string | null, breakEnd: string | null) {
  const start = parseTimeToMin(startTime);
  const end = parseTimeToMin(endTime);
  const bStart = breakStart ? parseTimeToMin(breakStart) : null;
  const bEnd = breakEnd ? parseTimeToMin(breakEnd) : null;

  if (start >= end) return 0;
  let count = 0;
  let curr = start;
  while (curr + 30 <= end) {
    const isBreak = bStart !== null && bEnd !== null && curr >= bStart && curr < bEnd;
    if (!isBreak) {
      count++;
    }
    curr += 30;
  }
  return count;
}

export function AvailabilityPanel({ isDark }: { isDark: boolean }) {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<string>('');
  const [schedule, setSchedule] = useState<{ [day: number]: DayAvailability }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize schedule with standard defaults
  const getDefaultDaySchedule = (dayOfWeek: number): DayAvailability => ({
    dayOfWeek,
    isActive: dayOfWeek !== 0, // Closed on Sundays by default
    startTime: '09:00',
    endTime: '19:00',
    breakStart: '12:00',
    breakEnd: '13:00',
    hasBreak: true,
  });

  const loadAvailability = useCallback(async (barberId?: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const url = barberId ? `/api/admin/availability?barberId=${barberId}` : '/api/admin/availability';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.barbers && data.barbers.length > 0) {
          setBarbers(data.barbers);
        }
        const activeBarberId = data.selectedBarberId || barberId || (data.barbers?.[0]?.id ?? '');
        setSelectedBarberId(activeBarberId);

        const newSched: { [day: number]: DayAvailability } = {};
        DAYS_ORDER.forEach(({ dayOfWeek }) => {
          newSched[dayOfWeek] = getDefaultDaySchedule(dayOfWeek);
        });

        if (Array.isArray(data.availabilities)) {
          data.availabilities.forEach((item: any) => {
            const hasBreak = Boolean(item.breakStart && item.breakEnd);
            newSched[item.dayOfWeek] = {
              dayOfWeek: item.dayOfWeek,
              isActive: Boolean(item.isActive),
              startTime: item.startTime || '09:00',
              endTime: item.endTime || '19:00',
              breakStart: item.breakStart || null,
              breakEnd: item.breakEnd || null,
              hasBreak,
            };
          });
        }
        setSchedule(newSched);
      } else {
        setErrorMessage('Não foi possível carregar a grade de horários.');
      }
    } catch (err) {
      console.error('Error loading availability:', err);
      setErrorMessage('Erro de conexão ao carregar a grade.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const handleBarberChange = (newBarberId: string) => {
    setSelectedBarberId(newBarberId);
    loadAvailability(newBarberId);
  };

  const handleToggleDay = (dayOfWeek: number) => {
    setSchedule((prev) => {
      const current = prev[dayOfWeek] || getDefaultDaySchedule(dayOfWeek);
      return {
        ...prev,
        [dayOfWeek]: {
          ...current,
          isActive: !current.isActive,
        },
      };
    });
    setSaveSuccess(false);
  };

  const handleChangeTime = (
    dayOfWeek: number,
    field: 'startTime' | 'endTime' | 'breakStart' | 'breakEnd',
    val: string
  ) => {
    setSchedule((prev) => {
      const current = prev[dayOfWeek] || getDefaultDaySchedule(dayOfWeek);
      return {
        ...prev,
        [dayOfWeek]: {
          ...current,
          [field]: val,
        },
      };
    });
    setSaveSuccess(false);
  };

  const handleToggleBreak = (dayOfWeek: number) => {
    setSchedule((prev) => {
      const current = prev[dayOfWeek] || getDefaultDaySchedule(dayOfWeek);
      const nextHasBreak = !current.hasBreak;
      return {
        ...prev,
        [dayOfWeek]: {
          ...current,
          hasBreak: nextHasBreak,
          breakStart: nextHasBreak ? current.breakStart || '12:00' : null,
          breakEnd: nextHasBreak ? current.breakEnd || '13:00' : null,
        },
      };
    });
    setSaveSuccess(false);
  };

  // Quick Presets
  const applyPreset = (preset: 'standard' | 'extended' | 'mon_fri' | 'copy_mon') => {
    setSchedule((prev) => {
      const updated = { ...prev };
      if (preset === 'standard') {
        DAYS_ORDER.forEach(({ dayOfWeek }) => {
          updated[dayOfWeek] = {
            dayOfWeek,
            isActive: dayOfWeek !== 0,
            startTime: '09:00',
            endTime: '19:00',
            breakStart: '12:00',
            breakEnd: '13:00',
            hasBreak: true,
          };
        });
      } else if (preset === 'extended') {
        DAYS_ORDER.forEach(({ dayOfWeek }) => {
          updated[dayOfWeek] = {
            dayOfWeek,
            isActive: dayOfWeek !== 0,
            startTime: '08:30',
            endTime: '20:30',
            breakStart: '12:00',
            breakEnd: '13:00',
            hasBreak: true,
          };
        });
      } else if (preset === 'mon_fri') {
        DAYS_ORDER.forEach(({ dayOfWeek }) => {
          updated[dayOfWeek] = {
            dayOfWeek,
            isActive: dayOfWeek >= 1 && dayOfWeek <= 5,
            startTime: '09:00',
            endTime: '19:00',
            breakStart: '12:00',
            breakEnd: '13:00',
            hasBreak: true,
          };
        });
      } else if (preset === 'copy_mon') {
        const mon = prev[1] || getDefaultDaySchedule(1);
        [2, 3, 4, 5, 6].forEach((day) => {
          updated[day] = {
            ...mon,
            dayOfWeek: day,
          };
        });
      }
      return updated;
    });
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const payloadAvailabilities = DAYS_ORDER.map(({ dayOfWeek }) => {
        const item = schedule[dayOfWeek] || getDefaultDaySchedule(dayOfWeek);
        return {
          dayOfWeek: item.dayOfWeek,
          isActive: item.isActive,
          startTime: item.startTime,
          endTime: item.endTime,
          breakStart: item.hasBreak ? item.breakStart : null,
          breakEnd: item.hasBreak ? item.breakEnd : null,
        };
      });

      const res = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barberId: selectedBarberId,
          availabilities: payloadAvailabilities,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 5000);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || 'Erro ao salvar disponibilidade.');
      }
    } catch (err) {
      console.error('Error saving availability:', err);
      setErrorMessage('Erro de conexão ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const currentBarberName = barbers.find((b) => b.id === selectedBarberId)?.name || 'Profissional';

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className={`text-base font-bold font-serif ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Horários de Atendimento & Grade de Expediente
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sincronizado c/ Landing Page
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Defina os dias de trabalho, horários de abertura/fechamento e pausas para almoço. Qualquer alteração salva aqui é atualizada em tempo real no agendamento dos clientes.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <a
            href="/#booking"
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
              isDark
                ? 'border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:border-[#C5A880]/50'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>Ver Agendamento</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#C5A880]" />
          </a>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-black text-xs font-bold hover:brightness-105 transition-all shadow-md shadow-[#C5A880]/20 disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Grade</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <div className="flex-1">
            <strong>Grade atualizada com sucesso!</strong> Os horários do barbeiro <u>{currentBarberName}</u> foram gravados no banco de dados e já estão disponíveis para reserva na landing page.
          </div>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs font-medium animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}

      {/* Barber Selection Tabs */}
      {barbers.length > 1 && (
        <div className={`p-1.5 rounded-xl border flex items-center gap-1.5 max-w-md ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
          {barbers.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => handleBarberChange(b.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                selectedBarberId === b.id
                  ? 'bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-black shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{b.name}</span>
              <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-semibold ${selectedBarberId === b.id ? 'bg-black/20 text-black' : 'bg-slate-800 text-slate-400'}`}>
                {b.role === 'OWNER' ? 'Proprietário' : 'Barbeiro'}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Quick Presets Bar */}
      <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200/90 shadow-2xs'}`}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C5A880]" />
          <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Predefinições Rápidas de Horário:
          </span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => applyPreset('standard')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
              isDark
                ? 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-[#C5A880] hover:text-[#C5A880]'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-[#C5A880]'
            }`}
          >
            Padrão Alemão (Seg a Sáb: 09h às 19h | Almoço 12h-13h)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('extended')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
              isDark
                ? 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-[#C5A880] hover:text-[#C5A880]'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-[#C5A880]'
            }`}
          >
            Estendido (08:30 às 20:30)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('mon_fri')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
              isDark
                ? 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-[#C5A880] hover:text-[#C5A880]'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-[#C5A880]'
            }`}
          >
            Segunda a Sexta (Folga Sábado & Domingo)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('copy_mon')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
              isDark
                ? 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-[#C5A880] hover:text-[#C5A880]'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-[#C5A880]'
            }`}
          >
            Copiar Horário de Segunda para Ter-Sáb
          </button>
        </div>
      </div>

      {/* Weekly Schedule Days List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Carregando grade de horários...
          </div>
        ) : (
          DAYS_ORDER.map(({ dayOfWeek, label, short }) => {
            const day = schedule[dayOfWeek] || getDefaultDaySchedule(dayOfWeek);
            const totalSlots = day.isActive
              ? countAvailableSlots(
                  day.startTime,
                  day.endTime,
                  day.hasBreak ? day.breakStart : null,
                  day.hasBreak ? day.breakEnd : null
                )
              : 0;

            return (
              <div
                key={dayOfWeek}
                className={`rounded-xl border transition-all p-4 ${
                  day.isActive
                    ? isDark
                      ? 'bg-slate-900/60 border-slate-800 hover:border-[#C5A880]/40'
                      : 'bg-white border-slate-200/90 shadow-2xs hover:border-[#C5A880]/40'
                    : isDark
                    ? 'bg-slate-950/40 border-slate-900 opacity-60'
                    : 'bg-slate-50/60 border-slate-200/60 opacity-60'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Day & Toggle */}
                  <div className="flex items-center gap-3.5 min-w-[200px]">
                    <button
                      type="button"
                      onClick={() => handleToggleDay(dayOfWeek)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        day.isActive ? 'bg-gradient-to-r from-[#C5A880] to-[#D4AF37]' : isDark ? 'bg-slate-700' : 'bg-slate-300'
                      }`}
                      role="switch"
                      aria-checked={day.isActive}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          day.isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {label}
                        </span>
                        {day.isActive ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-emerald-500/10 text-emerald-500">
                            Aberto
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-slate-500/10 text-slate-400">
                            Fechado
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {day.isActive ? `${totalSlots} horários de 30 min disponíveis` : 'Folga / Sem agendamento'}
                      </span>
                    </div>
                  </div>

                  {/* Middle / Right: Controls when Active */}
                  {day.isActive ? (
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      {/* Expediente Start / End */}
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                        <span className="text-slate-400">Expediente:</span>
                        <select
                          value={day.startTime}
                          onChange={(e) => handleChangeTime(dayOfWeek, 'startTime', e.target.value)}
                          className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold outline-none cursor-pointer ${
                            isDark
                              ? 'bg-slate-800 border-slate-700 text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        >
                          {TIME_OPTIONS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <span className="text-slate-400">às</span>
                        <select
                          value={day.endTime}
                          onChange={(e) => handleChangeTime(dayOfWeek, 'endTime', e.target.value)}
                          className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold outline-none cursor-pointer ${
                            isDark
                              ? 'bg-slate-800 border-slate-700 text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        >
                          {TIME_OPTIONS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Divider */}
                      <div className={`hidden sm:block h-6 w-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

                      {/* Lunch Break Toggle & Times */}
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={day.hasBreak}
                            onChange={() => handleToggleBreak(dayOfWeek)}
                            className="rounded accent-[#C5A880] cursor-pointer"
                          />
                          <Coffee className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="text-slate-400">Almoço / Pausa:</span>
                        </label>

                        {day.hasBreak ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={day.breakStart || '12:00'}
                              onChange={(e) => handleChangeTime(dayOfWeek, 'breakStart', e.target.value)}
                              className={`rounded-lg border px-2 py-1.5 text-xs font-semibold outline-none cursor-pointer ${
                                isDark
                                  ? 'bg-slate-800 border-slate-700 text-white'
                                  : 'bg-slate-50 border-slate-200 text-slate-900'
                              }`}
                            >
                              {TIME_OPTIONS.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                            <span className="text-slate-400">-</span>
                            <select
                              value={day.breakEnd || '13:00'}
                              onChange={(e) => handleChangeTime(dayOfWeek, 'breakEnd', e.target.value)}
                              className={`rounded-lg border px-2 py-1.5 text-xs font-semibold outline-none cursor-pointer ${
                                isDark
                                  ? 'bg-slate-800 border-slate-700 text-white'
                                  : 'bg-slate-50 border-slate-200 text-slate-900'
                              }`}
                            >
                              {TIME_OPTIONS.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Sem intervalo</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic">
                      Fechado o dia todo — a landing page não exibirá nenhum horário para reserva.
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Save Bar */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center gap-2.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            Os horários são gerados a cada 30 minutos respeitando intervalos e bloqueios de agendamentos já marcados.
          </span>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-black text-xs font-bold hover:brightness-105 transition-all shadow-md shadow-[#C5A880]/20 disabled:opacity-50"
        >
          {saving ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Salvando Alterações...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Grade de Horários</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
