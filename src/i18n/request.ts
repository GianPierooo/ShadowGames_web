import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
    // Zona horaria fija: fechas estables en servidor y cliente (evita
    // corrimientos de día e hidratación inconsistente en el Radar de Jams).
    timeZone: "UTC",
  };
});
