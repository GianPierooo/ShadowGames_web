import Image from "next/image";
import { cn } from "@/lib/cn";

interface BrandMarkProps {
  /** Muestra el wordmark "SHADOW GAMES" junto al símbolo. */
  withWordmark?: boolean;
  /** Tamaño del símbolo en px. */
  size?: number;
  className?: string;
}

/**
 * Marca del estudio: símbolo (logo.svg) + wordmark opcional en Fraunces.
 * El SVG es un placeholder hasta recibir el logo definitivo; reemplazar
 * public/brand/logo.svg conserva todo el layout.
 */
export function BrandMark({ withWordmark = true, size = 34, className }: BrandMarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/brand/logo.svg"
        alt="Shadow Games"
        width={size}
        height={size}
        priority
        unoptimized
        className="rounded-[8px]"
      />
      {withWordmark && (
        <span className="font-display text-lg font-bold tracking-tight leading-none">
          SHADOW GAMES
        </span>
      )}
    </span>
  );
}
