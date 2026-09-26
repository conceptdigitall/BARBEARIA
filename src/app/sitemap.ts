import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * /sitemap.xml — lista das páginas públicas. Envie este endereço no Google Search Console.
 * Quando criar páginas novas (ex.: blog), acrescente aqui.
 */
export default function sitemap(): MetadataRoute.Sitemap {
    return [
        { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
        { url: `${SITE_URL}/privacidade`, lastModified: new Date('2026-09-26'), changeFrequency: 'yearly', priority: 0.3 },
    ];
}
