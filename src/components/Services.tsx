'use client';

import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  promoPrice?: number | null;
  promoStartDate?: string | null;
  promoEndDate?: string | null;
  durationMin: number;
  imageUrl?: string | null;
}

interface ServicesProps {
  services: Service[];
  onSelectService: (serviceId: string) => void;
}

export default function Services({ services, onSelectService }: ServicesProps) {
  // Format price helper
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Check if promo is currently active
  const isPromoActive = (s: Service) => {
    if (!s.promoPrice || Number(s.promoPrice) <= 0) return false;
    const now = new Date();
    if (s.promoStartDate && new Date(s.promoStartDate) > now) return false;
    if (s.promoEndDate && new Date(s.promoEndDate) < now) return false;
    return true;
  };

  return (
    <section id="services" className="py-24 px-6 bg-beige-light text-black relative border-t border-black/5">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="text-orange-accent uppercase tracking-[0.25em] text-xs font-extrabold mb-3 block">
            Tabela de Valores
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-black mb-4 uppercase tracking-wide">
            Serviços & Preços
          </h2>
          <div className="w-16 h-[2px] bg-orange-accent mx-auto mb-6" />
          <p className="text-black/60 max-w-md mx-auto font-light text-sm md:text-base">
            Selecione a sua experiência. Trabalhamos apenas com produtos de altíssima qualidade para garantir o melhor resultado.
          </p>
        </div>

        {/* Layout Grid: Testimonial + Price List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Testimonial Card */}
          <div className="lg:col-span-4 h-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-orange-accent text-white p-8 md:p-10 rounded-2xl flex flex-col justify-between h-full min-h-[360px] shadow-lg relative overflow-hidden"
            >
              {/* Decorative quotation marks */}
              <div className="absolute top-0 right-0 text-[180px] font-serif font-black text-white/5 select-none pointer-events-none leading-none translate-y-[-40px] translate-x-[20px]">
                “
              </div>

              <div>
                <div className="flex gap-1 mb-6 text-white">
                  {/* 5 Stars */}
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                <p className="text-lg font-light leading-relaxed mb-8 text-white/95">
                  "Frequento a Barbearia do Alemão 777 há mais de 3 anos e o padrão é sempre excepcional. O atendimento é no horário, o café é excelente e o agendamento online é incrivelmente rápido."
                </p>
              </div>

              <div>
                <h4 className="font-serif text-lg font-bold uppercase tracking-wide text-white">
                  Carlos Eduardo M.
                </h4>
                <span className="text-white/70 text-xs font-light uppercase tracking-wider">
                  Cliente Mensal
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Editorial Pricing Table */}
          <div className="lg:col-span-8">
            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-bold text-black mb-8 uppercase tracking-widest">
                Nossos Valores
              </h3>
              
              <div className="divide-y divide-black/10">
                {services.map((service, index) => {
                  const hasPromo = isPromoActive(service);
                  const effectivePrice = hasPromo ? Number(service.promoPrice) : Number(service.price);

                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex-1 flex items-start gap-4">
                        {service.imageUrl && (
                          <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-black/10 border border-black/10 hidden sm:block">
                            <img
                              src={service.imageUrl}
                              alt={service.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div>
                          {/* Name, Badge & Duration */}
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <h4 className="font-serif text-lg font-bold text-black uppercase tracking-wide group-hover:text-orange-accent transition-colors duration-300">
                              {service.name}
                            </h4>

                            {hasPromo && (
                              <span className="px-2 py-0.5 bg-amber-500 text-black text-[9px] font-bold uppercase tracking-wider rounded">
                                Promoção
                              </span>
                            )}

                            <span className="flex items-center gap-1 text-black/40 text-xs font-light ml-1">
                              <Clock className="w-3.5 h-3.5 text-orange-accent" />
                              {service.durationMin} min
                            </span>
                          </div>
                          
                          {/* Description */}
                          {service.description && (
                            <p className="text-black/60 font-light text-xs leading-relaxed max-w-xl">
                              {service.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        <div className="text-right">
                          {hasPromo ? (
                            <div>
                              <span className="text-xs text-black/40 line-through mr-2">
                                {formatPrice(service.price)}
                              </span>
                              <span className="text-xl font-extrabold text-orange-accent font-serif">
                                {formatPrice(effectivePrice)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xl font-extrabold text-black font-serif">
                              {formatPrice(service.price)}
                            </span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => onSelectService(service.id)}
                          className="px-4 py-2 bg-transparent hover:bg-orange-accent text-orange-accent hover:text-white border border-orange-accent/30 hover:border-orange-accent font-bold text-[10px] uppercase tracking-wider transition-all duration-300"
                        >
                          Agendar
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
