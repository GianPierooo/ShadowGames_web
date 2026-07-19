import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BrandMark } from "@/components/site/brand-mark";
import { SocialLinks } from "@/components/site/social-links";

const NAV = [
  { href: "/juegos", key: "games" },
  { href: "/estudio", key: "studio" },
  { href: "/contacto", key: "contact" },
] as const;

export async function Footer() {
  const t = await getTranslations("Nav");
  const tf = await getTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Marca + manifiesto */}
          <div className="flex flex-col gap-4">
            <BrandMark size={36} />
            <p className="max-w-xs text-sm text-[var(--text-muted)]">
              {tf("madeWith")} {year}.
            </p>
            <SocialLinks className="mt-2" />
          </div>

          {/* Navegación */}
          <nav aria-label="Navegación del pie" className="flex flex-col gap-3">
            {NAV.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          {/* Idioma + legales */}
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-widest text-[var(--text-subtle)]">
              {tf("language")}
            </span>
            <span className="text-sm text-[var(--text-muted)]">Español</span>
            <div className="mt-4 flex flex-col gap-3">
              <Link
                href="/privacidad"
                className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              >
                {tf("privacy")}
              </Link>
              <Link
                href="/aviso-legal"
                className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              >
                {tf("legal")}
              </Link>
            </div>
          </div>
        </div>

        {/* Cierre: wordmark fantasma — remate editorial que convierte el pie
            utilitario en un "momento", sin añadir chrome ni copy. Decorativo
            (aria-hidden); color por color-mix para adaptarse al tema. El
            overflow-hidden lo recorta al ancho sin provocar scroll horizontal. */}
        <div
          aria-hidden
          className="pointer-events-none mt-14 select-none overflow-hidden"
        >
          <span
            className="block whitespace-nowrap font-display font-bold leading-[0.8] tracking-tight"
            style={{
              fontSize: "clamp(3rem, 13vw, 9rem)",
              color: "color-mix(in srgb, var(--text) 5%, transparent)",
            }}
          >
            Shadow Games
          </span>
        </div>

        <div className="mt-8 border-t border-[var(--border)] pt-6">
          <p className="text-xs text-[var(--text-subtle)]">
            © {year} Shadow Games Studio. {tf("rights")}.
          </p>
        </div>
      </div>
    </footer>
  );
}
