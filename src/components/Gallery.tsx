'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface GalleryProps {
  galleryUrls?: string[];
}

export default function Gallery({ galleryUrls }: GalleryProps) {
  const defaultImages = ['/haircut-fade.png', '/haircut-beard.png', '/haircut-classic.png'];
  const images = galleryUrls && galleryUrls.length >= 3 ? galleryUrls : defaultImages;

  const styles = [
    {
      title: 'Degradê Moderno (Fade)',
      description: 'Laterais limpas com transição suave e topo estilizado.',
      image: images[0],
    },
    {
      title: 'Barba Alinhada (Grooming)',
      description: 'Desenho preciso com navalha, toalha quente e hidratação.',
      image: images[1],
    },
    {
      title: 'Clássico Executivo (Pompadour)',
      description: 'Visual tradicional polido com pomada de alta fixação.',
      image: images[2],
    },
  ];

  return (
    <section id="gallery" className="py-24 px-6 bg-beige-light text-black relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="mb-16 md:flex md:justify-between md:items-end">
          <div className="max-w-xl">
            <span className="text-orange-accent uppercase tracking-[0.25em] text-xs font-extrabold mb-3 block">
              Galeria de Estilos
            </span>
            <h2 className="text-3xl md:text-5xl font-bold font-serif text-black mb-4 uppercase tracking-wide">
              Descubra nossos trabalhos
            </h2>
            <div className="w-16 h-[2px] bg-orange-accent mb-6" />
          </div>
          <p className="text-black/70 font-light text-sm md:text-base max-w-md leading-relaxed">
            Inspire-se para a sua próxima transformação. Nossos barbeiros são especialistas em traduzir sua personalidade em cortes impecáveis.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {styles.map((style, index) => (
            <motion.div
              key={style.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group flex flex-col"
            >
              {/* Image Container with Rounded Corners */}
              <div className="relative h-[380px] w-full overflow-hidden rounded-2xl mb-5 shadow-md">
                <Image
                  src={style.image}
                  alt={style.title}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
              </div>

              {/* Text */}
              <h3 className="font-serif text-xl font-extrabold text-black mb-2 uppercase tracking-wide">
                {style.title}
              </h3>
              <p className="text-black/60 font-light text-xs leading-relaxed">
                {style.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
