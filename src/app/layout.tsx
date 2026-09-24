import type { Metadata, Viewport } from "next";
import { Cinzel, Montserrat } from "next/font/google";
import "./globals.css";

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
  title: "Barbearia do Alemão 777 | Barbearia Premium em Cubatão",
  description: "Estilo é Escolha, Confiança é Resultado! Barbearia premium no Jardim Casqueiro, Cubatão - SP. Agende seu corte de cabelo ou barba sem atrito em menos de 1 minuto.",
  keywords: ["barbearia", "cubatão", "jardim casqueiro", "barba", "cabelo", "barbeiro", "alemão", "agendamento"],
  authors: [{ name: "Barbearia do Alemão 777" }],
  openGraph: {
    title: "Barbearia do Alemão 777 | Barbearia Premium",
    description: "Estilo é Escolha, Confiança é Resultado! Agende seu horário em poucos cliques.",
    url: "https://barbeariadoalemao777.com.br",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        {children}
      </body>
    </html>
  );
}
