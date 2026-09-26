'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from './Navbar';
import Hero from './Hero';
import About from './About';
import Gallery from './Gallery'; // Keep import in case it is used elsewhere or remove if unused, let's keep it clean
import InstagramCarousel from './InstagramCarousel';
import Services from './Services';
import BookingForm from './BookingForm';
import Location from './Location';
import Faq from './Faq';
import WhatsAppFloatingButton from './WhatsAppFloatingButton';

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationMin: number;
}

interface SiteConfig {
  heroName: string;
  instagram: string;
  whatsapp: string;
  address: string;
  galleryUrls: string[];
}

interface LandingPageWrapperProps {
  services: Service[];
  siteConfig: SiteConfig;
}

export default function LandingPageWrapper({ services, siteConfig }: LandingPageWrapperProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Track page views on mount
  useEffect(() => {
    fetch('/api/analytics/track', {
      method: 'POST',
    }).catch((err) => console.error('Error tracking visit:', err));
  }, []);

  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    
    // Smooth scroll to the booking section
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      const navbarHeight = 80;
      const targetPosition = bookingSection.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  };

  const handleBookingClick = () => {
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      const navbarHeight = 80;
      const targetPosition = bookingSection.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  };

  const handleClearSelection = () => {
    setSelectedServiceId(null);
  };

  return (
    <>
      {/* Header / Sticky Navbar */}
      <Navbar onBookingClick={handleBookingClick} heroName={siteConfig.heroName} />

      {/* Hero Section */}
      <Hero onBookingClick={handleBookingClick} heroName={siteConfig.heroName} />

      {/* Services & Pricing Section */}
      <Services services={services} onSelectService={handleSelectService} />

      {/* Frictionless Booking Section (No barbers prop needed since API defaults to owner) */}
      <BookingForm
        services={services}
        selectedServiceId={selectedServiceId}
        onClearSelection={handleClearSelection}
      />

      {/* Instagram Carousel Section */}
      <InstagramCarousel />

      {/* Location Section */}
      <Location 
        address={siteConfig.address} 
        instagram={siteConfig.instagram} 
        whatsapp={siteConfig.whatsapp} 
      />

      {/* About Us / Philosophy Section (Mapeado por último) */}
      <About />

      {/* Perguntas Frequentes */}
      <Faq />

      {/* Floating WhatsApp Button */}
      <WhatsAppFloatingButton phone={siteConfig.whatsapp} />

      {/* Premium Footer */}
      <footer className="bg-black text-white/50 pt-20 pb-10 border-t border-graphite-border/40 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Column 1: Brand & Contact */}
          <div className="lg:col-span-4 flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gold-primary/50 shadow-[0_0_15px_rgba(197,168,128,0.2)]">
                <Image
                  src="/logo.png"
                  alt="Barbearia do Alemão 777"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-serif text-lg font-black tracking-[0.2em] text-white">
                ALEMÃO <span className="text-gold-primary">777</span>
              </span>
            </div>
            <p className="text-xs font-light text-white/40 leading-relaxed max-w-xs mt-1">
              Estilo é Escolha, Confiança é Resultado! Vivencie o cuidado premium que você merece em Cubatão - SP.
            </p>
            <div className="text-xs font-light space-y-1.5 mt-2">
              <p className="text-white/60">{siteConfig.address}</p>
              <p className="text-white/60">WhatsApp: {siteConfig.whatsapp}</p>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Navegação</h4>
            <ul className="text-xs font-light space-y-2.5">
              <li><a href="#" className="hover:text-gold-primary transition-colors">Início</a></li>
              <li><a href="#about" className="hover:text-gold-primary transition-colors">Sobre Nós</a></li>
              <li><a href="#gallery" className="hover:text-gold-primary transition-colors">Estilos</a></li>
              <li><a href="#services" className="hover:text-gold-primary transition-colors">Preços</a></li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Links Rápidos</h4>
            <ul className="text-xs font-light space-y-2.5">
              <li><a href="#booking" className="hover:text-gold-primary transition-colors">Agendar Horário</a></li>
              <li><a href="#location" className="hover:text-gold-primary transition-colors">Como Chegar</a></li>
              <li><a href={siteConfig.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-gold-primary transition-colors">Instagram</a></li>
              <li><Link href="/privacidade" className="hover:text-gold-primary transition-colors">Política de privacidade</Link></li>
              <li><a href="/admin/login" className="text-gold-primary/80 hover:text-gold-primary font-semibold transition-colors">Acesso Administrativo</a></li>
            </ul>
          </div>

          {/* Column 4: Operational Hours */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Horário de Funcionamento</h4>
            <div className="text-xs font-light space-y-2 text-white/60">
              <div className="flex justify-between border-b border-graphite-border/30 pb-1.5">
                <span>Segunda - Sexta</span>
                <span className="text-white font-medium">09h às 20h</span>
              </div>
              <div className="flex justify-between border-b border-graphite-border/30 pb-1.5">
                <span>Sábado</span>
                <span className="text-white font-medium">09h às 19h</span>
              </div>
              <div className="flex justify-between text-white/30">
                <span>Domingo</span>
                <span>Fechado</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-graphite-border/30 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-white/30">
          <p>© {new Date().getFullYear()} Barbearia do Alemão 777. Todos os direitos reservados.</p>
          <p>Desenvolvido com sofisticação e atrito zero.</p>
        </div>
      </footer>
    </>
  );
}
