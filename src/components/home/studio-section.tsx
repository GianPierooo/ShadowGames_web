import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

/**
 * Sección "El estudio" — dos columnas: copy + key art.
 * El copy y el key art son placeholders hasta recibir la bio real y el arte.
 */
export async function StudioSection() {
  const t = await getTranslations("Home");

  return (
    <section
      className="cv-auto section-y relative px-6"
      aria-labelledby="studio-heading"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-16">
        <Reveal>
          <div className="flex flex-col gap-6">
            {/* Sin eyebrow: el h2 ya dice "El estudio" (PRINCIPLES: eyebrow+h2
                redundante = genérico). El h2 adopta .t-h2 (Fase 2) y lidera. */}
            <h2
              id="studio-heading"
              className="t-h2 font-display font-bold text-[var(--text)]"
            >
              {t("studioTitle")}
            </h2>
            <p className="max-w-prose text-lg leading-relaxed text-[var(--text-muted)]">
              {t("studioBody")}
            </p>
            <div>
              <Button asChild size="md" variant="outline">
                <Link href="/estudio">
                  {t("studioCta")}
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>

        {/* Foto real del equipo (mismo recuadro 4:5 que tenía el placeholder).
            La foto es 3:2 apaisada: con object-cover se recorta a lo ancho por el
            centro, donde están Gian y Leo, así que ninguno se sale del encuadre.
            El tratamiento de color (velo + viñeta + luz violeta) vive en
            globals.css (.studio-photo / .studio-photo-veil) para poder adaptarlo
            por tema. No lleva `priority`: la sección va bajo el fold. */}
        <Reveal delay={0.1}>
          <div className="studio-photo-veil relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)]">
            <Image
              src="/estudio-equipo.jpg"
              alt={t("studioPhotoAlt")}
              fill
              sizes="(min-width: 1152px) 544px, (min-width: 768px) 45vw, 100vw"
              className="studio-photo object-cover object-center"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
