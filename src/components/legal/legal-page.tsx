import type { ReactNode } from "react";

/**
 * Layout compartido para las páginas legales (/privacidad y /aviso-legal).
 *
 * Una sola columna `max-w-prose`, h1 sobrio (más contenido que las
 * páginas marketing), fecha de última actualización como `<time>`,
 * y secciones tipográficas con `<h2>` + `<p>` sobrios.
 *
 * Cero decoración: estas páginas no son marketing. PRINCIPLES.
 */

export interface LegalSection {
  heading: string;
  body: string;
}

interface LegalPageProps {
  eyebrow: string;
  title: string;
  lastUpdatedLabel: string;
  lastUpdated: string; // ISO date string (YYYY-MM-DD)
  sections: LegalSection[];
}

export function LegalPage({
  eyebrow,
  title,
  lastUpdatedLabel,
  lastUpdated,
  sections,
}: LegalPageProps) {
  return (
    <article className="mx-auto max-w-prose px-6 section-top pb-24 md:pb-32">
      <header className="mb-16">
        <p className="mb-4 text-xs uppercase tracking-[0.25em] text-[var(--text-subtle)]">
          {eyebrow}
        </p>
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-balance text-[var(--text)] md:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-sm text-[var(--text-muted)]">
          {lastUpdatedLabel}:{" "}
          <time dateTime={lastUpdated}>{formatDate(lastUpdated)}</time>
        </p>
      </header>

      <div className="space-y-12">
        {sections.map((s, i) => (
          <section key={i}>
            <h2 className="mb-4 font-display text-xl font-semibold text-[var(--text)]">
              {s.heading}
            </h2>
            <Prose>{s.body}</Prose>
          </section>
        ))}
      </div>
    </article>
  );
}

/** Renderiza el body como párrafos (split por dobles saltos). */
function Prose({ children }: { children: string }) {
  const paragraphs = children
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <div className="space-y-4 text-base leading-relaxed text-[var(--text-muted)]">
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

function formatDate(iso: string): ReactNode {
  // Formato español sobrio: "8 de junio de 2026".
  try {
    const d = new Date(iso + "T00:00:00Z");
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(d);
  } catch {
    return iso;
  }
}
