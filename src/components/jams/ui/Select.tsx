import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  options: SelectOption[];
  /** Etiqueta de la opción "sin filtro" (value ""). Si se omite, no se añade. */
  placeholder?: string;
  /** aria-label obligatorio para accesibilidad (el <select> no tiene <label> visible). */
  "aria-label": string;
}

/**
 * <select> nativo estilado (accesible y con teclado) con caret propio.
 * Nativo = mejor accesibilidad en móvil y con lector de pantalla.
 */
export function Select({
  options,
  placeholder,
  className,
  value,
  ...props
}: SelectProps) {
  const isActive = value !== "" && value != null;
  return (
    <div className="relative inline-flex">
      <select
        value={value}
        className={cn(
          "h-11 min-w-0 appearance-none rounded-xl border bg-radar-surface pl-3.5 pr-9",
          "text-[13.5px] font-medium transition-colors hover:border-edge-strong",
          isActive
            ? "border-ember/45 text-ember"
            : "border-edge text-radar-text",
          className,
        )}
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs",
          isActive ? "text-ember" : "text-faint",
        )}
      >
        ▾
      </span>
    </div>
  );
}
