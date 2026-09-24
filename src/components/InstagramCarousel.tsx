'use client';

import Script from 'next/script';

export default function InstagramCarousel() {
  return (
    <section id="gallery" className="py-24 px-6 bg-beige-light text-black relative border-t border-black/5">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-orange-accent uppercase tracking-[0.25em] text-xs font-extrabold mb-3 block">
            Galeria do Instagram
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-black mb-4 uppercase tracking-wide">
            Nosso Dia a Dia
          </h2>
          <div className="w-16 h-[2px] bg-orange-accent mx-auto mb-6" />
          <p className="text-black/70 font-light text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Siga-nos no Instagram para acompanhar nossos cortes, tendências e o ambiente premium da barbearia.
          </p>
        </div>

        {/* Elfsight Instagram Carousel App Container */}
        <div className="max-w-4xl mx-auto flex justify-center w-full">
          <div className="elfsight-app-aad40530-07b3-4f3e-8804-563c606b14eb w-full" data-elfsight-app-lazy></div>
        </div>

      </div>

      {/* Lazy Load Elfsight Platform Script for performance */}
      <Script 
        src="https://elfsightcdn.com/platform.js" 
        strategy="lazyOnload" 
      />
    </section>
  );
}
