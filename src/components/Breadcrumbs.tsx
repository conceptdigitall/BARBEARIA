import Link from "next/link";
import { SITE_URL } from "@/lib/site";

type Crumb = { name: string; href: string };

/**
 * Trilha "Início › Página" + dados estruturados BreadcrumbList para o Google.
 * Use no topo das páginas internas (não na home, que é de página única).
 */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ name: "Início", href: "/" }, ...items];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.href === "/" ? "/" : c.href}`,
    })),
  };
  return (
    <nav aria-label="Você está em" className="text-xs text-white/40 uppercase tracking-wider">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ol className="flex flex-wrap items-center gap-2">
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={c.href} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className="text-white/70">{c.name}</span>
              ) : (
                <Link href={c.href} className="hover:text-gold-primary transition-colors">{c.name}</Link>
              )}
              {!last && <span aria-hidden="true">›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
