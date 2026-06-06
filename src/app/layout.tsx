/**
 * Layout root. El layout de verdad vive en `app/[locale]/layout.tsx`.
 * Este existe sólo porque Next.js requiere un layout en la raíz; pasa los
 * children directamente sin envolverlos, así el layout localizado decide
 * la estructura HTML.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
