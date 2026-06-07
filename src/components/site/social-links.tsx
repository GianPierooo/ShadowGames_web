import { SOCIAL, SOCIAL_LABELS, type SocialKey } from "@/lib/social";
import { SOCIAL_ICONS } from "@/components/site/brand-icons";
import { cn } from "@/lib/cn";

interface SocialLinksProps {
  /** Qué redes mostrar y en qué orden. */
  only?: SocialKey[];
  /** Oculta las que aún no tienen URL real (href === "#"). */
  hidePlaceholders?: boolean;
  className?: string;
  iconClassName?: string;
}

const DEFAULT_ORDER: SocialKey[] = ["discord", "x", "youtube", "instagram", "bluesky"];

/**
 * Fila de enlaces a redes sociales con iconos de marca.
 * Las URLs viven en lib/social.ts (placeholders "#" en fase 1).
 */
export function SocialLinks({
  only,
  hidePlaceholders = false,
  className,
  iconClassName,
}: SocialLinksProps) {
  const keys = (only ?? DEFAULT_ORDER).filter((k) => {
    if (hidePlaceholders && SOCIAL[k] === "#") return false;
    return true;
  });

  return (
    <ul className={cn("flex items-center gap-1.5", className)}>
      {keys.map((key) => {
        const Icon = SOCIAL_ICONS[key];
        const href = SOCIAL[key];
        const isPlaceholder = href === "#";
        return (
          <li key={key}>
            <a
              href={href}
              {...(!isPlaceholder && { target: "_blank", rel: "noopener noreferrer" })}
              aria-label={SOCIAL_LABELS[key]}
              title={SOCIAL_LABELS[key]}
              className={cn(
                "grid size-11 cursor-pointer place-items-center rounded-full",
                "border border-[var(--border)] bg-[var(--surface)]/50 text-[var(--text-muted)]",
                "transition-colors duration-200 hover:border-[var(--accent)]/60 hover:text-[var(--accent)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
                iconClassName,
              )}
            >
              <Icon className="size-[18px]" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
