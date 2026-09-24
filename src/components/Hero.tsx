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
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Subtle Badge with Official Logo */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 bg-graphite-dark/80 backdrop-blur-md border border-gold-primary/30 px-3.5 py-2 rounded-full mb-6 shadow-[0_0_20px_rgba(197,168,128,0.15)]"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gold-primary shadow-[0_0_10px_rgba(197,168,128,0.4)]">
                <Image
                  src="/logo.png"
                  alt="Barbearia do Alemão 777"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
              <div className="flex items-center gap-2 text-gold-primary uppercase tracking-[0.25em] text-[11px] md:text-xs font-semibold pr-2">
                <span>Desde 2020</span>
                <span className="text-white/30">•</span>
                <span>Cubatão, SP</span>
              </div>
            </motion.div>

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

          {/* Right Column: Hero Image (Kawe) */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-lg lg:max-w-xl group"
            >
              {/* Soft ambient gold aura glow behind photo */}
              <div className="absolute -inset-3 bg-gradient-to-tr from-gold-primary/25 via-gold-accent/15 to-transparent rounded-3xl blur-2xl -z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Main Photo - Preserving natural dimensions and aspect ratio */}
              <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-gold-primary/30 bg-graphite-dark">
                <Image
                  src="/Kawe - Hero.png"
                  alt="Kawe - Barbearia do Alemão 777"
                  width={1536}
                  height={1024}
                  priority
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                {/* Subtle luxury vignette at the bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
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
