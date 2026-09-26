'use client';

/**
 * Analytics do site: Google Analytics 4 (só depois do aceite de cookies)
 * + Vercel Web Analytics (sem cookies, sempre ligado).
 *
 * - O ID do GA4 vem de NEXT_PUBLIC_GA_ID (ex.: G-XXXXXXXXXX). Sem ID, o GA não carrega.
 * - O consentimento fica em localStorage "cookie_consent" ("true" / "false").
 *   Quando o banner muda a escolha, ele dispara o evento "cookie-consent-change".
 * - Conversões: todo clique em link de WhatsApp ou telefone vira o evento
 *   "generate_lead" no GA4. Marque esse evento como "evento principal" no GA4.
 */

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/next';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

type Gtag = (...args: unknown[]) => void;

function readConsent(): boolean {
    try {
        return localStorage.getItem('cookie_consent') === 'true';
    } catch {
        return false;
    }
}

/** Dispara um evento no GA4 (se o GA estiver carregado). */
export function gaEvent(name: string, params: Record<string, unknown> = {}) {
    if (typeof window === 'undefined') return;
    const gtag = (window as unknown as { gtag?: Gtag }).gtag;
    if (typeof gtag === 'function') gtag('event', name, params);
}

export default function SiteAnalytics() {
    const [consent, setConsent] = useState(false);

    useEffect(() => {
        setConsent(readConsent());
        const onChange = () => setConsent(readConsent());
        window.addEventListener('cookie-consent-change', onChange);
        window.addEventListener('storage', onChange);
        return () => {
            window.removeEventListener('cookie-consent-change', onChange);
            window.removeEventListener('storage', onChange);
        };
    }, []);

    // Conversões: cliques em WhatsApp e telefone
    useEffect(() => {
        if (!GA_ID || !consent) return;
        const onClick = (e: MouseEvent) => {
            const link = (e.target as HTMLElement | null)?.closest?.('a');
            const href = link?.getAttribute('href') || '';
            if (/wa\.me|api\.whatsapp\.com|whatsapp:/i.test(href)) {
                gaEvent('generate_lead', { method: 'whatsapp', link_url: href.split('?')[0] });
            } else if (href.startsWith('tel:')) {
                gaEvent('generate_lead', { method: 'telefone' });
            }
        };
        document.addEventListener('click', onClick, { capture: true });
        return () => document.removeEventListener('click', onClick, { capture: true });
    }, [consent]);

    return (
        <>
            <Analytics />
            {GA_ID && consent && (
                <>
                    <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
                    <Script id="ga4-init" strategy="afterInteractive">
                        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA_ID}', { anonymize_ip: true });`}
                    </Script>
                </>
            )}
        </>
    );
}
