'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface NavbarProps {
  onBookingClick: () => void;
  heroName?: string;
}

export default function Navbar({ onBookingClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Início', href: '#' },
    { name: 'Sobre Nós', href: '#about' },
    { name: 'Estilos', href: '#gallery' },
    { name: 'Serviços & Preços', href: '#services' },
    { name: 'Localização', href: '#location' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);

    if (href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const target = document.querySelector(href);
    if (target) {
      const navbarHeight = 80;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled
          ? 'bg-[#0A0A0B]/90 backdrop-blur-md border-b border-graphite-border/60 py-3 shadow-lg'
          : 'bg-transparent py-4'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => handleLinkClick(e, '#')}
            className="flex items-center hover:opacity-95 transition-all duration-300 focus:outline-none group py-0.5"
            aria-label="Barbearia do Alemão 777"
          >
            <div className="relative h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 flex-shrink-0">
              <Image
                src="/logo-alemao.png"
                alt="Logo Oficial Barbearia do Alemão 777"
                fill
                sizes="(max-width: 768px) 64px, 80px"
                priority
                className="object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] drop-shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 hover:text-gold-primary transition-colors duration-300"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Booking CTA Button */}
          <div className="hidden md:block">
            <button
              onClick={onBookingClick}
              className="px-6 py-2.5 bg-gold-primary hover:bg-gold-hover text-black text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300"
            >
              Agendar Horário
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white hover:text-gold-primary transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-45 bg-[#0A0A0B] pt-24 px-6 flex flex-col justify-between pb-12 md:hidden"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link, index) => (
                <motion.a
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="text-xl font-serif font-bold text-white hover:text-gold-primary transition-colors py-2 border-b border-graphite-border/30"
                >
                  {link.name}
                </motion.a>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => {
                setIsOpen(false);
                onBookingClick();
              }}
              className="w-full py-4 bg-gold-primary hover:bg-gold-hover text-black text-xs font-bold uppercase tracking-widest transition-all duration-300"
            >
              Agendar Horário
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
