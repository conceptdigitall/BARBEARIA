'use client';

/**
 * Banner de cookies (LGPD). O Google Analytics só carrega depois do "Aceitar".
 * Guarda a escolha em localStorage "cookie_consent" e avisa o SiteAnalytics
 * pelo evento "cookie-consent-change".
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Props = {
    /** Cor do botão "Aceitar" (hex). */
    accent?: string;
    /** Cor do texto do botão "Aceitar". */
    accentText?: string;
};

export default function CookieBanner({ accent = '#C5A880', accentText = '#0a0a0b' }: Props) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        try {
            if (localStorage.getItem('cookie_consent') === null) {
                const t = setTimeout(() => setVisible(true), 1200);
                return () => clearTimeout(t);
            }
        } catch {
            /* navegação privada: não mostra o banner e o GA fica desligado */
        }
    }, []);

    const choose = (value: 'true' | 'false') => {
        try {
            localStorage.setItem('cookie_consent', value);
        } catch {
            /* ignora */
        }
        window.dispatchEvent(new Event('cookie-consent-change'));
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div
            role="dialog"
            aria-live="polite"
            aria-label="Aviso de cookies"
            className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4"
        >
            <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-white/10 bg-[#111113]/95 p-4 text-sm text-white/80 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:gap-5">
                <p className="flex-1 leading-relaxed">
                    Usamos cookies para entender como o site é usado e melhorar sua experiência. Você pode aceitar ou recusar. Saiba mais na{' '}
                    <Link href="/privacidade" className="underline underline-offset-2 hover:text-white">
                        política de privacidade
                    </Link>
                    .
                </p>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => choose('false')}
                        className="rounded-lg border border-white/15 px-4 py-2 font-semibold text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                    >
                        Recusar
                    </button>
                    <button
                        type="button"
                        onClick={() => choose('true')}
                        className="rounded-lg px-4 py-2 font-bold transition-opacity hover:opacity-90"
                        style={{ backgroundColor: accent, color: accentText }}
                    >
                        Aceitar
                    </button>
                </div>
            </div>
        </div>
    );
}
