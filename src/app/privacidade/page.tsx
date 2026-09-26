import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Política de privacidade | Barbearia do Alemão 777",
  description: "Como a Barbearia do Alemão 777 trata os dados de quem visita o site e agenda um horário, conforme a LGPD.",
  alternates: { canonical: "/privacidade" },
};

/*
 * Modelo baseado no que o site realmente coleta hoje (set/2026).
 * Revise se adicionar formulário, newsletter ou outra ferramenta.
 * Não é aconselhamento jurídico: vale uma revisão de um advogado.
 */
const UPDATED = "26 de setembro de 2026";

const H = ({ children }: { children: ReactNode }) => (
  <h2 className="font-serif text-2xl md:text-3xl font-bold uppercase tracking-wide text-white pt-4">{children}</h2>
);
const P = ({ children }: { children: ReactNode }) => (
  <p className="text-sm md:text-base font-light leading-relaxed text-foreground/60">{children}</p>
);
const LI = ({ children }: { children: ReactNode }) => (
  <li className="text-sm md:text-base font-light leading-relaxed text-foreground/60 pl-5 relative before:content-[''] before:absolute before:left-0 before:top-[0.7em] before:w-2 before:h-[2px] before:bg-gold-primary">
    {children}
  </li>
);

export default function Privacidade() {
  return (
    <section className="min-h-screen bg-black px-6 py-24">
      <div className="max-w-3xl mx-auto flex flex-col gap-5">
        <Breadcrumbs items={[{ name: "Política de privacidade", href: "/privacidade" }]} />
        <span className="text-gold-primary uppercase tracking-[0.25em] text-xs font-semibold">LGPD</span>
        <h1 className="font-serif text-4xl md:text-5xl font-extrabold uppercase tracking-wide text-white mb-2">
          Política de privacidade
        </h1>

        <P>Última atualização: {UPDATED}.</P>
        <P>
          Esta política explica quais dados a Barbearia do Alemão 777 coleta quando você visita este site ou agenda um horário, para que
          usamos e quais são os seus direitos pela Lei Geral de Proteção de Dados (Lei 13.709/2018).
        </P>

        <H>Quem é o responsável</H>
        <P>Barbearia do Alemão 777, Rua Espanha, 360 - Jardim Casqueiro, Cubatão - SP. [CNPJ, se houver]. Contato: WhatsApp +55 13 97424-9209 e [E-MAIL OFICIAL].</P>

        <H>O que coletamos</H>
        <ul className="flex flex-col gap-3">
          <LI>
            <strong className="text-white">Dados do agendamento:</strong> nome e número de WhatsApp informados no formulário de agendamento, usados só para confirmar seu horário e enviar o lembrete de 2h antes.
          </LI>
          <LI>
            <strong className="text-white">Métricas de uso do site:</strong> páginas visitadas, tempo na página e tipo de aparelho. Não coletamos nome, e-mail ou telefone nessas métricas.
          </LI>
          <LI>
            <strong className="text-white">Google Analytics:</strong> só é ativado se você clicar em &quot;Aceitar&quot; no aviso de cookies. Ajuda a medir de onde vêm as visitas.
          </LI>
          <LI>
            <strong className="text-white">Vercel Analytics:</strong> contagem de visitas e desempenho do site, sem cookies e sem identificar você.
          </LI>
          <LI>
            <strong className="text-white">WhatsApp:</strong> ao clicar em um botão de WhatsApp, a conversa acontece no aplicativo do WhatsApp (Meta), com as regras de privacidade dele.
          </LI>
        </ul>

        <H>Para que usamos</H>
        <P>Para confirmar e lembrar seu horário, entender como o site é usado, melhorar o conteúdo e responder quem entra em contato. Não vendemos seus dados.</P>

        <H>Base legal</H>
        <P>
          Execução do serviço contratado (dados do agendamento), consentimento (cookies do Google Analytics) e legítimo interesse (métricas
          sem identificação e segurança do site).
        </P>

        <H>Com quem compartilhamos</H>
        <P>
          Apenas com os fornecedores que fazem o site e o agendamento funcionarem: Vercel (hospedagem), Clever Cloud (banco de dados dos
          agendamentos) e Google, nas situações descritas acima. Alguns deles guardam dados fora do Brasil.
        </P>

        <H>Por quanto tempo</H>
        <P>Dados de agendamento ficam guardados por até [PRAZO, ex.: 24 meses] ou enquanto você for cliente. Métricas de uso seguem o mesmo prazo.</P>

        <H>Seus direitos</H>
        <P>
          Você pode pedir a confirmação de que tratamos seus dados, acesso, correção, exclusão, e retirar o consentimento de cookies a
          qualquer momento (limpando os cookies do navegador, o aviso aparece de novo).
        </P>
        <P>
          Para qualquer pedido, fale com a gente pelo{" "}
          <a
            href="https://api.whatsapp.com/send?phone=5513974249209&text=Ol%C3%A1!%20Tenho%20um%20pedido%20sobre%20meus%20dados%20(LGPD)."
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-primary underline underline-offset-4"
          >
            WhatsApp
          </a>
          .
        </P>

        <Link href="/" className="mt-4 text-sm text-white/60 hover:text-gold-primary transition-colors">
          ← Voltar para o início
        </Link>
      </div>
    </section>
  );
}
