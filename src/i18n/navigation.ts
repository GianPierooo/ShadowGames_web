import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Helpers de navegación tipados que respetan los pathnames localizados.
 * Usar estos en lugar de los de `next/link` y `next/navigation`.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
