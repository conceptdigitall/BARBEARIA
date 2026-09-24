'use client';

import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, CheckCircle2, User as UserIcon, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Service {
  id: string;
  name: string;
  price: number;
  durationMin: number;
}

interface BookingFormProps {
  services: Service[];
  selectedServiceId: string | null;
  onClearSelection: () => void;
}

export default function BookingForm({
  services,
  selectedServiceId,
  onClearSelection,
}: BookingFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const serviceId = selectedServices[0]?.id || '';
  const [barberId, setBarberId] = useState<string>('');
  const [barbersList, setBarbersList] = useState<{ id: string; name: string; role: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Available slots state
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Next 7 days list for premium horizontal picker
  const [daysList, setDaysList] = useState<{ dateStr: string; label: string; weekday: string }[]>([]);

  // Format price helper
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Fetch active barbers on mount
  useEffect(() => {
    const fetchBarber = async () => {
      try {
        const res = await fetch('/api/barbers');
        if (res.ok) {
          const data = await res.json();
          if (data.barbers && data.barbers.length > 0) {
            setBarbersList(data.barbers);
            setBarberId((prev) => prev || data.barbers[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching barbers:', err);
      }
    };
    fetchBarber();
  }, []);

  // Pre-select service if passed from parent
  useEffect(() => {
    if (selectedServiceId) {
      const s = services.find(x => x.id === selectedServiceId);
      if (s) {
        setSelectedServices([s]);
        setStep(2); // Go directly to step 2 (Barber & Time)
      }
    }
  }, [selectedServiceId, services]);

  const handleToggleService = (service: Service) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      } else {
        if (prev.length >= 3) {
          alert('Você pode selecionar no máximo 3 serviços.');
          return prev;
        }
        return [...prev, service];
      }
    });
  };

  // Generate next 7 working days (excluding Sundays)
  useEffect(() => {
    const list = [];
    const today = new Date();
    
    for (let i = 0; i < 10; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      
      if (d.getDay() !== 0) { // Exclude Sundays
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
        const label = d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace(' de', '');

        list.push({ dateStr, label, weekday });
      }
      
      if (list.length === 7) break; // Limit to 7 available days
    }
    setDaysList(list);
    if (list.length > 0) {
      setSelectedDate(list[0].dateStr);
    }
  }, []);

  // Fetch available slots when barber or date changes
  useEffect(() => {
    if (!selectedDate) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const res = await fetch(`/api/appointments?date=${selectedDate}&barberId=${barberId || ''}`);
        if (res.ok) {
          const data = await res.json();
          setAvailableSlots(data.slots || []);
        }
      } catch (err) {
        console.error('Error fetching slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, barberId]);

  // Format phone number as (99) 99999-9999
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    setPhone(value);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId || !barberId || !selectedDate || !selectedTime || !name || !phone) return;

    setLoading(true);
    try {
      const formattedPhone = `+55${phone.replace(/\D/g, '')}`;
      const additionalServicesPayload = selectedServices.slice(1).map(s => ({
        id: s.id,
        name: s.name,
        price: Number(s.price),
        durationMin: s.durationMin,
      }));

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          barberId,
          date: selectedDate,
          time: selectedTime,
          clientName: name,
          clientPhone: formattedPhone,
          additionalServices: additionalServicesPayload,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        // Clear state
        setName('');
        setPhone('');
        setSelectedServices([]);
        setBarberId('');
        setSelectedTime('');
        onClearSelection();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Erro ao realizar agendamento.');
      }
    } catch (err) {
      console.error('Error booking:', err);
      alert('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const selectedService = services.find(s => s.id === serviceId);

  if (success) {
    return (
      <section id="booking" className="py-24 px-6 bg-background border-t border-graphite-border/30">
        <div className="max-w-md mx-auto glass-panel p-10 text-center flex flex-col items-center border border-gold-primary/20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-full bg-gold-primary/10 border border-gold-primary text-gold-primary flex items-center justify-center mb-8"
          >
            <CheckCircle2 className="w-10 h-10" />
          </motion.div>
          <h3 className="font-serif text-2xl md:text-3xl font-extrabold text-white mb-4 uppercase tracking-wider">
            Pré-reservado!
          </h3>
          <p className="text-foreground/60 font-light text-sm mb-8 leading-relaxed">
            Enviamos uma mensagem no seu WhatsApp para confirmar o seu horário. Por favor, verifique seu celular para concluir a sua reserva.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setStep(1);
            }}
            className="w-full py-4 bg-gold-primary hover:bg-gold-hover text-black font-bold text-xs tracking-wider uppercase transition-all duration-300"
          >
            Fazer Novo Agendamento
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="py-24 px-6 bg-background border-t border-graphite-border/30 relative overflow-hidden">
      {/* Glow details */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold-primary/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-gold-primary uppercase tracking-[0.25em] text-xs font-bold mb-3 block">
            Agendamento Rápido
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-white mb-4 uppercase tracking-wide">
            Reserve seu horário
          </h2>
          <div className="w-16 h-[2px] bg-gold-primary mx-auto mb-6" />
          <p className="text-foreground/60 max-w-sm mx-auto font-light text-sm">
            Sem senhas. Apenas 3 passos rápidos para agendar seu corte.
          </p>
        </div>

        {/* Steps Tracker */}
        <div className="flex justify-between items-center mb-12 max-w-xs mx-auto text-[10px] font-bold tracking-[0.2em] uppercase">
          <span className={`${step >= 1 ? 'text-gold-primary' : 'text-white/30'} transition-colors duration-300`}>
            1. Serviço
          </span>
          <span className={`h-[1px] w-8 ${step >= 2 ? 'bg-gold-primary/50' : 'bg-graphite-border'} transition-colors duration-300`} />
          <span className={`${step >= 2 ? 'text-gold-primary' : 'text-white/30'} transition-colors duration-300`}>
            2. Horário
          </span>
          <span className={`h-[1px] w-8 ${step >= 3 ? 'bg-gold-primary/50' : 'bg-graphite-border'} transition-colors duration-300`} />
          <span className={`${step >= 3 ? 'text-gold-primary' : 'text-white/30'} transition-colors duration-300`}>
            3. Contato
          </span>
        </div>

        {/* Form Container */}
        <div className="glass-panel p-6 md:p-10 border border-gold-primary/10">
          <form onSubmit={handleBooking} className="space-y-6">
            
            {/* STEP 1: SERVICE SELECTION */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-gold-primary">
                    Selecione os Serviços (Máx. 3)
                  </label>
                  <span className="text-[10px] text-white/40 font-semibold uppercase">
                    {selectedServices.length} / 3 Selecionados
                  </span>
                </div>
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 scrollbar-none">
                  {services.map((service) => {
                    const isSelected = selectedServices.some(s => s.id === service.id);
                    return (
                      <div
                        key={service.id}
                        onClick={() => handleToggleService(service)}
                        className={`p-4 border cursor-pointer transition-all duration-300 flex justify-between items-center ${
                          isSelected
                            ? 'border-gold-primary bg-gold-primary/5'
                            : 'border-graphite-border bg-graphite-light/40 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="w-4 h-4 accent-gold-primary rounded border-graphite-border cursor-pointer"
                          />
                          <div>
                            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wide">{service.name}</h4>
                            <span className="text-[10px] text-white/40 font-light">{service.durationMin} min</span>
                          </div>
                        </div>
                        <span className="font-extrabold text-gold-primary text-sm">
                          {formatPrice(service.price)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={selectedServices.length === 0}
                  onClick={() => setStep(2)}
                  className="w-full py-4 mt-4 bg-gold-primary disabled:bg-gold-primary/10 disabled:text-white/20 hover:bg-gold-hover text-black font-bold text-xs tracking-wider uppercase transition-all duration-300"
                >
                  Continuar
                </button>
              </div>
            )}

            {/* STEP 2: DATE & TIME */}
            {step === 2 && (
              <div className="space-y-6">

                {/* Barber Selection */}
                {barbersList.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-gold-primary">
                      Escolha o Barbeiro
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {barbersList.map((b) => {
                        const isSelected = barberId === b.id;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              setBarberId(b.id);
                              setSelectedTime('');
                            }}
                            className={`py-3 px-3 border text-center transition-all duration-300 flex items-center justify-between ${
                              isSelected
                                ? 'border-gold-primary bg-gold-primary/10 text-gold-primary'
                                : 'border-graphite-border bg-graphite-light/40 text-white/70 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-3.5 h-3.5" />
                              <span className="text-xs font-bold font-serif uppercase tracking-wider">{b.name}</span>
                            </div>
                            <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-semibold ${isSelected ? 'bg-gold-primary text-black' : 'bg-white/10 text-white/60'}`}>
                              {b.role === 'OWNER' ? 'Principal' : 'Barbeiro'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Date Picker (Horizontal Calendar) */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-gold-primary">
                    Escolha o Dia
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {daysList.map((day) => (
                      <div
                        key={day.dateStr}
                        onClick={() => {
                          setSelectedDate(day.dateStr);
                          setSelectedTime('');
                        }}
                        className={`p-3 border text-center cursor-pointer min-w-[70px] transition-all duration-300 flex-shrink-0 ${
                          selectedDate === day.dateStr
                            ? 'border-gold-primary bg-gold-primary/10 text-gold-primary'
                            : 'border-graphite-border bg-graphite-light/40 hover:border-white/20'
                        }`}
                      >
                        <span className="text-[9px] uppercase text-white/40 block mb-1 font-bold">{day.weekday}</span>
                        <span className="text-sm font-extrabold text-white block">{day.label.split(' ')[0]}</span>
                        <span className="text-[8px] uppercase text-gold-primary/70 font-semibold">{day.label.split(' ')[1]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time Slot Grid */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-gold-primary">
                      Horários Disponíveis
                    </label>
                    {availableSlots.length > 0 && (
                      <span className="text-[10px] text-white/40 font-semibold uppercase">
                        {availableSlots.length} horários livres
                      </span>
                    )}
                  </div>
                  
                  {loadingSlots ? (
                    <div className="py-8 text-center text-xs text-white/40">Carregando horários...</div>
                  ) : availableSlots.length === 0 ? (
                    <div className="py-8 px-4 text-center text-xs border border-dashed border-graphite-border bg-graphite-light/20 space-y-2">
                      <p className="font-semibold text-white/70">
                        Nenhum horário disponível para este dia.
                      </p>
                      <p className="text-[11px] text-white/40 font-light">
                        Os horários deste profissional já foram preenchidos ou o expediente foi encerrado. Selecione outro dia acima para agendar!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 max-h-[160px] overflow-y-auto pr-1">
                      {availableSlots.map((time) => (
                        <div
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2.5 text-center text-xs font-bold cursor-pointer transition-all duration-300 border ${
                            selectedTime === time
                              ? 'border-gold-primary bg-gold-primary text-black'
                              : 'border-graphite-border bg-graphite-light/40 hover:border-white/20 text-white'
                          }`}
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      onClearSelection();
                      setStep(1);
                    }}
                    className="py-4 bg-transparent hover:bg-white/5 text-white border border-white/10 hover:border-white/20 font-bold text-xs tracking-wider uppercase transition-all duration-300"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    disabled={!selectedTime}
                    onClick={() => setStep(3)}
                    className="py-4 bg-gold-primary disabled:bg-gold-primary/10 disabled:text-white/20 hover:bg-gold-hover text-black font-bold text-xs tracking-wider uppercase transition-all duration-300"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CONTACT & CONFIRMATION */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Booking Summary */}
                <div className="p-4 bg-graphite-light/60 border border-graphite-border/60 space-y-2 text-xs">
                  <div className="space-y-1">
                    <span className="text-white/40 font-light block">Serviços Selecionados:</span>
                    {selectedServices.map(s => (
                      <div key={s.id} className="flex justify-between font-serif text-xs font-bold text-white uppercase tracking-wide">
                        <span>{s.name}</span>
                        <span>{formatPrice(s.price)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between border-t border-graphite-border/30 pt-2">
                    <span className="text-white/40 font-light">Profissional:</span>
                    <span className="text-white font-bold">
                      {barbersList.find((b) => b.id === barberId)?.name || 'Alemão'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40 font-light">Duração Total:</span>
                    <span className="text-white font-bold">
                      {selectedServices.reduce((sum, s) => sum + s.durationMin, 0)} min
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40 font-light">Data e Hora:</span>
                    <span className="text-gold-primary font-bold">
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                      })}{' '}
                      às {selectedTime}
                    </span>
                  </div>
                  <div className="border-t border-graphite-border/60 pt-2 flex justify-between font-extrabold text-sm">
                    <span className="text-white/70 font-serif">Total:</span>
                    <span className="text-gold-primary">
                      {formatPrice(selectedServices.reduce((sum, s) => sum + s.price, 0))}
                    </span>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="client-name" className="block text-[10px] font-bold tracking-[0.15em] uppercase text-white/60">
                      Seu Nome
                    </label>
                    <input
                      id="client-name"
                      type="text"
                      required
                      placeholder="Ex: João Silva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-graphite-light border border-graphite-border focus:border-gold-primary text-white text-sm outline-none transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="client-phone" className="block text-[10px] font-bold tracking-[0.15em] uppercase text-white/60">
                      Seu WhatsApp
                    </label>
                    <input
                      id="client-phone"
                      type="text"
                      required
                      placeholder="Ex: (13) 97424-9209"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="w-full px-4 py-3 bg-graphite-light border border-graphite-border focus:border-gold-primary text-white text-sm outline-none transition-all duration-300"
                    />
                    <span className="text-[9px] text-white/35 block mt-1 font-light leading-relaxed">
                      Usaremos este número para enviar o lembrete de confirmação de 2h via WhatsApp.
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="py-4 bg-transparent hover:bg-white/5 text-white border border-white/10 hover:border-white/20 font-bold text-xs tracking-wider uppercase transition-all duration-300"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !name || phone.length < 15}
                    className="py-4 bg-gold-primary disabled:bg-gold-primary/10 disabled:text-white/20 hover:bg-gold-hover text-black font-bold text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Confirmando...' : 'Confirmar'}
                  </button>
                </div>
              </div>
            )}

          </form>
        </div>
      </div>
    </section>
  );
}
