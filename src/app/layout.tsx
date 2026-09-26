import type { Metadata, Viewport } from "next";
import { Cinzel, Montserrat } from "next/font/google";
import "./globals.css";
import SiteAnalytics from "@/components/SiteAnalytics";
import CookieBanner from "@/components/CookieBanner";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Barbearia do Alemão 777 | Barbearia em Cubatão – Jardim Casqueiro",
  description: "Barbearia no Jardim Casqueiro, Cubatão - SP. Corte, degradê, barba com toalha quente e sobrancelha. Agende online em menos de 1 minuto.",
  keywords: ["barbearia cubatão", "barbearia jardim casqueiro", "barbeiro cubatão", "corte degradê", "barba", "agendamento barbearia"],
  authors: [{ name: SITE_NAME }],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Barbearia do Alemão 777 | Cubatão",
    description: "Estilo é Escolha, Confiança é Resultado! Agende seu horário em poucos cliques.",
    url: "/",
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "website",
    // A imagem vem de src/app/opengraph-image.tsx (gerada automaticamente).
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  // Google Search Console → "Tag HTML": cole só o valor do content em NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

/**
 * Dados estruturados (schema.org) para o Google mostrar a barbearia na busca local.
 * Horário igual ao exibido no rodapé (LandingPageWrapper); domingo fechado, por isso não entra aqui.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HairSalon",
  name: SITE_NAME,
  url: SITE_URL,
  image: `${SITE_URL}/logo.png`,
  telephone: "+55 13 97424-9209",
  priceRange: "R$ 15 – R$ 90",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rua Espanha, 360 - Jardim Casqueiro",
    addressLocality: "Cubatão",
    addressRegion: "SP",
    addressCountry: "BR",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "20:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "09:00",
      closes: "19:00",
    },
  ],
  sameAs: ["https://www.instagram.com/barbeariadoalemao777/"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Zoom liberado: bloquear prejudica a acessibilidade (e a nota do Lighthouse).
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${cinzel.variable} ${montserrat.variable} h-full antialiased scroll-smooth overflow-x-hidden max-w-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-x-hidden max-w-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <CookieBanner accent="#C5A880" accentText="#0a0a0b" />
        <SiteAnalytics />
      </body>
    </html>
  );
}
