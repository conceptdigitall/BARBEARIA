/**
 * Endereço público do site (usado no sitemap, robots, links canônicos e Open Graph).
 * Ordem: NEXT_PUBLIC_SITE_URL (defina na Vercel com o domínio final)
 *        → domínio de produção que a Vercel informa automaticamente
 *        → https://barbeariadoalemao777.com.br
 */
const vercelProd = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;

export const SITE_URL = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (vercelProd ? `https://${vercelProd}` : 'https://barbeariadoalemao777.com.br')
).replace(/\/$/, '');

export const SITE_NAME = 'Barbearia do Alemão 777';

/** Promessa de resposta perto do CTA de agendamento. Confirmado: a pré-reserva já garante o horário na hora. */
export const RESPONSE_PROMISE = 'Horário confirmado na hora, sem espera';
