"use client";

import { useTranslations } from "next-intl";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/**
 * CTA "Ver tráiler" + modal. Hoy muestra un placeholder cinematográfico
 * ("próximamente"); en H2 el contenido del DialogContent se reemplaza por el
 * reproductor real (YouTube embed o <video>).
 */
export function TrailerDialog() {
  const t = useTranslations("Hero");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline">
          <Play className="size-4" />
          {t("ctaTrailer")}
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden p-0">
        <div className="relative aspect-video w-full">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--surface-2),var(--bg))]" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex flex-col items-center gap-4 px-6 text-center">
              <span className="grid size-16 place-items-center rounded-full border border-[var(--accent)]/40 bg-[var(--accent-soft)]">
                <Play className="size-7 text-[var(--accent)]" />
              </span>
              <DialogTitle className="font-display text-2xl font-bold">
                {t("ctaTrailer")}
              </DialogTitle>
              <DialogDescription className="text-[var(--text-muted)]">
                {t("trailerComingSoon")}
              </DialogDescription>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
