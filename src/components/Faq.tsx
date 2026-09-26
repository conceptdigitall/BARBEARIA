const FAQ = [
  {
    q: "Preciso agendar ou vocês atendem sem hora marcada?",
    a: "Aceitamos encaixe quando há vaga na agenda, mas agendar pelo site garante o seu horário.",
  },
  {
    q: "Quais formas de pagamento vocês aceitam?",
    a: "Dinheiro, Pix e cartão de débito/crédito.",
  },
  {
    q: "Qual o horário de funcionamento?",
    a: "Segunda a sexta das 09h às 20h, sábado das 09h às 19h. Domingo não abrimos.",
  },
  {
    q: "Onde fica a barbearia?",
    a: "Rua Espanha, 360 - Jardim Casqueiro, Cubatão - SP.",
  },
  {
    q: "Vou receber confirmação do meu horário?",
    a: "Sim, você recebe um lembrete de confirmação por WhatsApp 2h antes do horário marcado.",
  },
];

export default function Faq() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section id="faq" className="py-24 px-6 bg-black relative border-t border-graphite-border/40">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-gold-primary uppercase tracking-[0.25em] text-xs font-semibold mb-3 block">
            Dúvidas
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-white mb-4 uppercase tracking-wide">
            Perguntas frequentes
          </h2>
          <div className="w-16 h-[2px] bg-gold-primary mx-auto" />
        </div>

        <div className="flex flex-col border-t border-graphite-border/40">
          {FAQ.map((f) => (
            <details key={f.q} className="group border-b border-graphite-border/40 py-6">
              <summary className="flex items-start justify-between gap-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden min-h-[44px]">
                <span className="font-serif text-lg md:text-xl font-semibold leading-snug text-white">{f.q}</span>
                <span
                  aria-hidden="true"
                  className="mt-1 flex-shrink-0 w-7 h-7 rounded-full border border-gold-primary/40 flex items-center justify-center text-gold-primary transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-4 text-sm md:text-base font-light leading-relaxed text-foreground/60 max-w-2xl">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
