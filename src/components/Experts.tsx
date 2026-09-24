'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Mail } from 'lucide-react';

interface Barber {
  id: string;
  name: string;
}

interface ExpertsProps {
  barbers: Barber[];
}

export default function Experts({ barbers }: ExpertsProps) {
  // Map index to a specific generated image or fallback
  const getBarberImage = (index: number) => {
    const images = ['/barber-expert-1.png', '/barber-expert-2.png'];
    return images[index % images.length];
  };

  const getBarberRole = (index: number, name: string) => {
    if (name.toLowerCase().includes('alemão')) return 'Founder & Master Barber';
    return index === 0 ? 'Specialist Barber' : 'Stylist Barber';
  };

  return (
    <section id="experts" className="py-24 px-6 bg-white text-black relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-orange-accent uppercase tracking-[0.25em] text-xs font-extrabold mb-3 block">
            Nossos Especialistas
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-black mb-4 uppercase tracking-wide">
            Conheça o time
          </h2>
          <div className="w-16 h-[2px] bg-orange-accent mx-auto mb-6" />
          <p className="text-black/60 max-w-md mx-auto font-light text-sm md:text-base">
            Profissionais dedicados a oferecer o melhor corte com atendimento personalizado e atrito zero.
          </p>
        </div>

        {/* Experts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {barbers.map((barber, index) => (
            <motion.div
              key={barber.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-zinc-50 border border-zinc-150 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col"
            >
              {/* Photo */}
              <div className="relative h-[360px] w-full overflow-hidden">
                <Image
                  src={getBarberImage(index)}
                  alt={barber.name}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-103"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-300" />
              </div>

              {/* Info */}
              <div className="p-6 text-center">
                <h3 className="font-serif text-xl font-extrabold text-black mb-1 uppercase tracking-wide">
                  {barber.name}
                </h3>
                <p className="text-orange-accent text-xs font-semibold uppercase tracking-wider">
                  {getBarberRole(index, barber.name)}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Join Our Team Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: barbers.length * 0.1 }}
            className="bg-black text-white rounded-2xl p-8 flex flex-col justify-between items-center text-center border border-graphite-border h-full min-h-[440px] shadow-lg relative group overflow-hidden"
          >
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="my-auto flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border border-gold-primary/20 flex items-center justify-center text-gold-primary mb-6 group-hover:scale-105 transition-transform duration-300">
                <Mail className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-white mb-4 uppercase tracking-wide">
                Quer se juntar ao nosso time?
              </h3>
              <p className="text-white/60 font-light text-sm leading-relaxed max-w-xs mb-8">
                Estamos sempre em busca de talentos apaixonados por barbearia e atendimento de excelência.
              </p>
            </div>

            <a
              href="mailto:vagas@barbeariadoalemao777.com.br?subject=Interesse%20em%20vaga%20de%20Barbeiro"
              className="w-full py-4 bg-white hover:bg-gold-primary hover:text-black text-black font-semibold text-xs tracking-wider uppercase transition-all duration-300 rounded-lg shadow-md z-10"
            >
              Enviar Currículo
            </a>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
