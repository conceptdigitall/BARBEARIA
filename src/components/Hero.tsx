'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface HeroProps {
  onBookingClick: () => void;
  heroName?: string;
}

export default function Hero({ onBookingClick, heroName }: HeroProps) {
  const handleExploreClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      const navbarHeight = 80;
      const targetPosition = servicesSection.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center pt-28 pb-16 px-6 overflow-hidden bg-black">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold-accent/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Text & Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Subtle Badge */}
            <motion.span 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-gold-primary uppercase tracking-[0.3em] text-xs md:text-sm font-semibold mb-4 block"
            >
              Desde 2020 • Cubatão, SP
            </motion.span>

            {/* Brand Name */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-wider mb-6 font-serif leading-[1.05] text-white uppercase"
            >
              Barbearia do <br />
              <span className="text-gold-gradient block mt-2">
                {heroName || 'Alemão 777'}
              </span>
            </motion.h1>

            {/* Slogan */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl text-foreground font-light mb-6 leading-relaxed italic max-w-xl border-l-2 border-gold-primary/35 pl-4"
            >
              "Estilo é escolha, <span className="text-gold-primary font-medium">confiança</span> é resultado!"
            </motion.p>

            {/* Introductory Text */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-sm md:text-base text-foreground/60 font-light mb-10 max-w-lg leading-relaxed"
            >
              Vivencie o melhor em cuidados masculinos. Cortes precisos, barba alinhada com toalha quente e um ambiente premium projetado para o seu conforto.
            </motion.p>

            {/* Call To Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <button
                onClick={onBookingClick}
                className="px-8 py-4 bg-gold-primary hover:bg-gold-hover text-black font-bold tracking-wider text-xs uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(197,168,128,0.25)] hover:shadow-[0_4px_30px_rgba(197,168,128,0.4)]"
              >
                Agendar Horário
              </button>
              
              <button
                onClick={handleExploreClick}
                className="px-8 py-4 bg-transparent hover:bg-white/5 text-white font-semibold tracking-wider text-xs border border-white/25 hover:border-gold-primary uppercase transition-all duration-300"
              >
                Ver Serviços
              </button>
            </motion.div>
          </div>

          {/* Right Column: Hero Image Frame */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-[280px] sm:w-[360px] h-[390px] sm:h-[490px] group"
            >
              {/* Background gold border offset */}
              <div className="absolute top-4 left-4 right-[-16px] bottom-[-16px] border border-gold-primary/35 transition-transform duration-500 group-hover:translate-x-1 group-hover:translate-y-1 -z-10" />

              {/* Main Image */}
              <div className="relative w-full h-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-graphite-dark border border-gold-primary/20">
                <Image
                  src="/hero-model-new.jpg"
                  alt="Barbearia do Alemão 777"
                  fill
                  priority
                  className="object-cover object-[center_12%] transition-transform duration-700 group-hover:scale-103"
                />
                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <span className="text-[9px] uppercase tracking-[0.25em] text-white/30">Explore o Espaço</span>
        <motion.div 
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-1 h-1 bg-gold-primary rounded-full"
        />
      </div>
    </section>
  );
}
