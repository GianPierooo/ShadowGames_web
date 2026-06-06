"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

// Suscripción no-op — getSnapshot devuelve true en cliente, false en server.
// Patrón canónico React 19 para "¿estoy hidratado?" sin setState-in-effect.
const subscribe = () => () => {};
const getClient = () => true;
const getServer = () => false;

/**
 * Toggle simple entre dark y light. Respeta prefers-color-scheme en primera
 * visita (gestionado por next-themes con `enableSystem`) y persiste en
 * localStorage tras el primer click.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("Theme");
  const mounted = useSyncExternalStore(subscribe, getClient, getServer);

  const isDark = resolvedTheme === "dark";
  const next = isDark ? "light" : "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={t("toggle")}
      title={t("toggle")}
      onClick={() => setTheme(next)}
    >
      {mounted ? (
        isDark ? <Moon className="size-5" /> : <Sun className="size-5" />
      ) : (
        // Placeholder con mismas dimensiones para evitar layout shift
        <span className="size-5" aria-hidden />
      )}
    </Button>
  );
}
