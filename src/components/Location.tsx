'use client';

import { motion } from 'framer-motion';
import { Compass, Instagram, MapPin, Navigation, Phone } from 'lucide-react';

interface LocationProps {
  address?: string;
  instagram?: string;
  whatsapp?: string;
}

export default function Location({ address, instagram, whatsapp }: LocationProps) {
  const finalAddress = address || 'Rua Espanha, 360 - Jardim Casqueiro - Cubatão / SP';
  const finalInstagram = instagram || 'https://www.instagram.com/barbeariadoalemao777/';
  const finalWhatsapp = whatsapp || '+5513974249209';

  // Format WhatsApp link correctly (wa.me)
  const numericWhatsapp = finalWhatsapp.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${numericWhatsapp}`;
  
  // Direct GPS routing links
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(finalAddress)}`;
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(finalAddress)}&navigate=yes`;

  return (
    <section id="location" className="py-24 px-6 bg-graphite-dark relative overflow-hidden border-t border-graphite-border/30">
      {/* Background glow */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gold-primary/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Text and Contact Info */}
          <div className="lg:col-span-7">
            <span className="text-gold-primary uppercase tracking-[0.25em] text-xs font-bold mb-3 block">
              Onde Estamos
            </span>
            <h2 className="text-3xl md:text-5xl font-bold font-serif mb-4 text-white uppercase tracking-wide">
              Localização & Contato
            </h2>
            <div className="w-16 h-[2px] bg-gold-primary mb-8" />

            {/* Address */}
            <div className="flex items-start gap-4 mb-8">
              <div className="p-3.5 bg-background border border-gold-primary/20 text-gold-primary rounded-xl">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-white mb-1 uppercase tracking-wide">Endereço</h4>
                <p className="text-foreground/70 font-light text-sm leading-relaxed">
                  {finalAddress}
                </p>
              </div>
            </div>

            {/* Contact Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 bg-background/40 hover:bg-background/85 border border-graphite-border hover:border-gold-primary/40 transition-all duration-300 group rounded-xl"
              >
                <div className="p-2.5 bg-background border border-graphite-border group-hover:border-gold-primary/30 text-gold-primary rounded-lg">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-serif text-sm font-bold text-white uppercase tracking-wide">WhatsApp</h5>
                  <p className="text-foreground/55 text-xs font-light mt-0.5">{finalWhatsapp}</p>
                </div>
              </a>

              <a 
                href={finalInstagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 bg-background/40 hover:bg-background/85 border border-graphite-border hover:border-gold-primary/40 transition-all duration-300 group rounded-xl"
              >
                <div className="p-2.5 bg-background border border-graphite-border group-hover:border-gold-primary/30 text-gold-primary rounded-lg">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-serif text-sm font-bold text-white uppercase tracking-wide">Instagram</h5>
                  <p className="text-foreground/55 text-xs font-light mt-0.5">
                    @{finalInstagram.replace(/\/$/, '').split('/').pop() || 'barbeariadoalemao777'}
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Right Column: GPS Routing Card */}
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-panel p-8 md:p-10 relative flex flex-col items-center text-center border border-gold-primary/10 rounded-2xl"
            >
              {/* Decorative Compass Icon */}
              <div className="w-16 h-16 rounded-full border border-gold-primary/20 flex items-center justify-center text-gold-primary mb-6">
                <Compass className="w-7 h-7 animate-pulse" />
              </div>

              <h3 className="font-serif text-2xl font-bold text-white mb-3 uppercase tracking-wider">
                Rota sem atrito
              </h3>
              <p className="text-foreground/60 font-light text-xs md:text-sm mb-8 leading-relaxed max-w-xs">
                Clique em um dos botões abaixo para abrir a rota direta no seu aplicativo de GPS preferido e chegar até nós sem complicação.
              </p>

              {/* Navigation Buttons */}
              <div className="flex flex-col gap-4 w-full">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 py-4 bg-gold-primary hover:bg-gold-hover text-black font-bold text-xs tracking-wider uppercase transition-all duration-300 rounded-lg"
                >
                  <Navigation className="w-4 h-4 fill-current" />
                  Abrir no Google Maps
                </a>

                <a
                  href={wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 py-4 bg-transparent hover:bg-white/5 text-white font-bold text-xs tracking-wider uppercase border border-white/10 hover:border-gold-primary transition-all duration-300 rounded-lg"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-gold-primary">
                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.93l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.88c-.12.2-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                  </svg>
                  Abrir no Waze
                </a>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
