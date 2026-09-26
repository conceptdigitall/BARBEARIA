import type { Metadata } from "next";
import Link from "next/link";
import { RESPONSE_PROMISE } from "@/lib/site";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Obrigado pelo contato | Barbearia do Alemão 777",
  description: "Recebemos seu contato. Veja os próximos passos com a Barbearia do Alemão 777.",
  // Página de conversão: fora do Google.
  robots: { index: false, follow: false },
};

const NEXT = [
  { title: "Conversa no WhatsApp", text: "Sua aba abriu com a mensagem já pronta para enviar." },
  { title: "Escolha o horário", text: "Combine o melhor dia e horário direto com a gente, ou agende pelo site." },
  { title: "Chegue no horário marcado", text: "Rua Espanha, 360 - Jardim Casqueiro, Cubatão - SP." },
];

export default function Obrigado() {
  return (
    <section className="min-h-screen bg-black px-6 py-24 flex flex-col items-center text-center gap-10">
      <div className="max-w-2xl flex flex-col gap-4">
        <Breadcrumbs items={[{ name: "Obrigado", href: "/obrigado" }]} />
        <span className="text-gold-primary uppercase tracking-[0.25em] text-xs font-semibold">Contato recebido</span>
        <h1 className="font-serif text-4xl md:text-6xl font-extrabold uppercase tracking-wide text-white leading-[1.05]">
          Obrigado! Já estamos com você.
        </h1>
        <p className="text-sm md:text-base font-light leading-relaxed text-foreground/60">
          Sua conversa abriu no WhatsApp em outra aba. {RESPONSE_PROMISE}. Se a aba não abriu, use o botão abaixo.
        </p>
      </div>

      <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {NEXT.map((s, i) => (
          <li key={s.title} className="bg-graphite-dark border border-graphite-border rounded-2xl p-7 flex flex-col gap-3 text-left">
            <span className="font-serif text-sm font-bold text-gold-primary">{String(i + 1).padStart(2, "0")}</span>
            <span className="font-serif text-lg font-bold uppercase tracking-wide text-white">{s.title}</span>
            <span className="text-sm font-light leading-relaxed text-foreground/60">{s.text}</span>
          </li>
        ))}
      </ol>

      <div className="flex flex-col sm:flex-row gap-4">
        <a
          href="https://api.whatsapp.com/send?phone=5513974249209&text=Ol%C3%A1!%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio%20na%20Barbearia%20do%20Alem%C3%A3o."
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 py-4 bg-gold-primary hover:bg-gold-hover text-black font-bold tracking-wider text-xs uppercase transition-all duration-300"
        >
          Abrir o WhatsApp
        </a>
        <Link
          href="/#services"
          className="px-8 py-4 bg-transparent hover:bg-white/5 text-white font-semibold tracking-wider text-xs border border-white/25 hover:border-gold-primary uppercase transition-all duration-300"
        >
          Ver serviços enquanto isso
        </Link>
      </div>
    </section>
  );
}
