'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Award, Clock, ShieldCheck } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-24 px-6 bg-graphite-dark relative overflow-hidden border-t border-graphite-border/40">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-gold-primary/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Premium Image Composition */}
          <div className="lg:col-span-6 relative h-[450px] md:h-[550px] w-full group">
            {/* Background decorative border frame */}
            <div className="absolute top-4 left-4 right-[-16px] bottom-[-16px] border border-gold-primary/30 transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2 -z-10" />
            
            {/* Main Image */}
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src="/barber-bg.png"
                alt="Trabalho na Barbearia"
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              {/* Vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
            
            {/* Experience badge */}
            <div className="absolute bottom-6 left-6 bg-gold-primary text-black px-6 py-4 font-serif text-center shadow-lg">
              <span className="block text-3xl font-extrabold tracking-tight">6+</span>
              <span className="text-[9px] font-bold uppercase tracking-widest block">Anos de Estilo</span>
            </div>
          </div>

          {/* Right Column: Editorial Text Content */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <span className="text-gold-primary uppercase tracking-[0.25em] text-xs font-bold mb-3 block">
              Nossa Essência
            </span>
            
            <h2 className="text-3xl md:text-5xl font-bold font-serif text-white mb-8 leading-[1.15] uppercase tracking-wide">
              Nós revivemos as tradições do <span className="text-gold-gradient">corte clássico</span>
            </h2>
            
            <p className="text-foreground/75 font-light text-sm md:text-base leading-relaxed mb-8">
              Na Barbearia do Alemão 777, acreditamos que um corte de cabelo ou uma barba bem feita são mais do que estética — são rituais de confiança. Fundada em Cubatão/SP, nossa missão é oferecer uma experiência impecável que une a precisão clássica das técnicas tradicionais com a conveniência do mundo moderno.
            </p>
            
            <div className="space-y-6">
              {/* Feature 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 border border-gold-primary/20 flex items-center justify-center text-gold-primary bg-background/40">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-white text-base font-semibold mb-1">Padrão de Excelência</h4>
                  <p className="text-foreground/60 text-xs font-light leading-relaxed">
                    Nossos profissionais passam por treinamentos constantes nas últimas tendências e técnicas clássicas de visagismo.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 border border-gold-primary/20 flex items-center justify-center text-gold-primary bg-background/40">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-white text-base font-semibold mb-1">Atrito Zero de Verdade</h4>
                  <p className="text-foreground/60 text-xs font-light leading-relaxed">
                    Nada de ligações ou esperas exaustivas. Agende seu horário online em menos de 1 minuto e seja atendido no horário exato.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 border border-gold-primary/20 flex items-center justify-center text-gold-primary bg-background/40">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-white text-base font-semibold mb-1">Produtos Selecionados</h4>
                  <p className="text-foreground/60 text-xs font-light leading-relaxed">
                    Utilizamos apenas loções, pomadas e shampoos premium de marcas consolidadas para cuidar do seu cabelo e pele.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
