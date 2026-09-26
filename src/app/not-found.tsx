import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Página não encontrada | Barbearia do Alemão 777",
};

const WHATSAPP = "+5513974249209";
const MESSAGE = "Olá! Cheguei numa página que não existe no site e queria falar com vocês.";
const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP.replace(/\D/g, "")}&text=${encodeURIComponent(MESSAGE)}`;

export default function NotFound() {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center px-6 py-24 overflow-hidden bg-black">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold-accent/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-2xl w-full flex flex-col items-center text-center gap-8">
        <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gold-primary shadow-[0_0_10px_rgba(197,168,128,0.4)]">
          <Image src="/logo.png" alt="Barbearia do Alemão 777" fill sizes="64px" className="object-cover" />
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-gold-primary uppercase tracking-[0.25em] text-xs font-semibold">Erro 404</span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-wider font-serif leading-[1.05] text-white uppercase">
            Esse corte <span className="text-gold-gradient">não existe.</span>
          </h1>
          <p className="text-sm md:text-base text-foreground/60 font-light max-w-lg mx-auto leading-relaxed">
            O endereço pode ter mudado ou foi digitado errado. Volte para o início, veja os serviços ou fale direto com a gente.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/"
            className="px-8 py-4 bg-gold-primary hover:bg-gold-hover text-black font-bold tracking-wider text-xs uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(197,168,128,0.25)] hover:shadow-[0_4px_30px_rgba(197,168,128,0.4)]"
          >
            Voltar para o início
          </Link>
          <Link
            href="/#services"
            className="px-8 py-4 bg-transparent hover:bg-white/5 text-white font-semibold tracking-wider text-xs border border-white/25 hover:border-gold-primary uppercase transition-all duration-300"
          >
            Ver serviços
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-transparent text-white/70 hover:text-gold-primary font-semibold tracking-wider text-xs uppercase transition-all duration-300"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
