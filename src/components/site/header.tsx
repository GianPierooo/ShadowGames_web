"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { SOCIAL } from "@/lib/social";
import { DiscordIcon } from "@/components/site/brand-icons";
import { BrandMark } from "@/components/site/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/juegos", key: "games" },
  { href: "/jams", key: "radar" },
  { href: "/estudio", key: "studio" },
  { href: "/press", key: "press" },
  { href: "/contacto", key: "contact" },
] as const;

export function Header() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const discordReady = SOCIAL.discord !== "#";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-4 pt-4 md:pt-5">
      <div
        className={cn(
          "pointer-events-auto mx-auto flex max-w-6xl items-center justify-between gap-4",
          "rounded-[var(--radius-pill)] border px-4 py-2.5 md:px-5",
          "transition-all duration-300",
          scrolled
            ? "border-[var(--border)] bg-[var(--bg)]/80 shadow-[var(--shadow-card)] backdrop-blur-xl"
            : "border-transparent bg-[var(--bg)]/30 backdrop-blur-md",
        )}
      >
        {/* Marca */}
        <Link
          href="/"
          className="shrink-0 rounded-[var(--radius-pill)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          aria-label="Shadow Games — Inicio"
        >
          <BrandMark size={32} className="text-[var(--text)]" />
        </Link>

        {/* Nav central — pills (desktop) */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "rounded-[var(--radius-pill)] px-4 py-2 text-sm font-medium",
                  "transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--text)]",
                )}
                aria-current={active ? "page" : undefined}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle />

          <Button
            asChild
            size="sm"
            variant="solid"
            className="hidden sm:inline-flex"
            {...(!discordReady && { "aria-disabled": true })}
          >
            <a
              href={SOCIAL.discord}
              {...(discordReady && { target: "_blank", rel: "noopener noreferrer" })}
            >
              <DiscordIcon className="size-4" />
              {t("discord")}
            </a>
          </Button>

          {/* Botón menú móvil */}
          <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
            <DialogTrigger asChild>
              <Button
                variant="pill"
                size="icon"
                className="lg:hidden"
                aria-label="Abrir menú"
              >
                <Menu className="size-5" />
              </Button>
            </DialogTrigger>
            <DialogContent
              hideClose
              className="flex max-w-md flex-col gap-2 p-6"
            >
              <DialogTitle className="sr-only">Menú</DialogTitle>
              <div className="mb-4 flex items-center justify-between">
                <BrandMark size={30} />
                <DialogClose asChild>
                  <Button variant="pill" size="icon" aria-label="Cerrar menú">
                    <Menu className="size-5 rotate-90" />
                  </Button>
                </DialogClose>
              </div>
              <nav className="flex flex-col" aria-label="Navegación móvil">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "border-b border-[var(--border)] py-4 font-display text-2xl font-bold tracking-tight",
                      "transition-colors hover:text-[var(--accent)]",
                    )}
                  >
                    {t(item.key)}
                  </Link>
                ))}
              </nav>
              <Button asChild size="md" className="mt-6 w-full">
                <a
                  href={SOCIAL.discord}
                  {...(discordReady && { target: "_blank", rel: "noopener noreferrer" })}
                  onClick={() => setMenuOpen(false)}
                >
                  <DiscordIcon className="size-5" />
                  {t("discord")}
                </a>
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
