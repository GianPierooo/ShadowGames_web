"use client";

import { useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { contactSchema, type ContactInput } from "@/lib/contact-schema";
import { sendContactEmail } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * Formulario de contacto.
 *
 * - `react-hook-form` + `zodResolver` con el schema compartido
 *   (`@/lib/contact-schema`). Modo `onBlur` + `reValidateMode: "onChange"`
 *   tal como recomienda la guía de a11y (`ux/Inline Validation`).
 * - Campos con `<label htmlFor>` reales, `aria-invalid` + `aria-describedby`
 *   apuntando a un `<p role="alert">` por campo.
 * - Honeypot `website` oculto a humanos y a screen readers (sr-only + hidden
 *   inputmode + tabIndex=-1 + autocomplete=off).
 * - Submit vía Server Action; toasts Sonner para feedback.
 * - Tras éxito: reset del form + foco al heading de la página (#contact-title).
 */
export function ContactForm() {
  const t = useTranslations("Contact");
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const ids = {
    name: useId(),
    email: useId(),
    subject: useId(),
    message: useId(),
  };
  const errIds = {
    name: `${ids.name}-err`,
    email: `${ids.email}-err`,
    subject: `${ids.subject}-err`,
    message: `${ids.message}-err`,
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      website: "",
    },
  });

  /** Traduce una clave de error del schema o devuelve fallback genérico. */
  const tErr = (key: string | undefined): string | undefined => {
    if (!key) return undefined;
    // Las claves del schema son "errorNameMin" etc., todas existen en es.json.
    return t(key as Parameters<typeof t>[0]);
  };

  async function onSubmit(values: ContactInput) {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("name", values.name);
      fd.set("email", values.email);
      fd.set("subject", values.subject);
      fd.set("message", values.message);
      fd.set("website", values.website ?? "");

      const result = await sendContactEmail(fd);

      if (result.ok) {
        toast.success(t("successTitle"), { description: t("successBody") });
        reset();
        // Foco a un heading semánticamente cercano para que el lector de
        // pantalla anuncie el contexto tras enviar.
        document
          .getElementById("contact-title")
          ?.scrollIntoView({ block: "start", behavior: "smooth" });
        (document.getElementById("contact-title") as HTMLElement | null)?.focus();
        return;
      }

      switch (result.kind) {
        case "rate_limited":
          toast.error(t("errorTitle"), { description: t("errorRateLimited") });
          break;
        case "not_configured":
          toast.error(t("errorTitle"), { description: t("errorNotConfigured") });
          break;
        case "validation":
          // Server detectó algo que el cliente dejó pasar — extremadamente raro
          // dado que comparten schema. Mensaje genérico.
          toast.error(t("errorTitle"), { description: t("errorBody") });
          break;
        case "send_failed":
        default:
          toast.error(t("errorTitle"), { description: t("errorBody") });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-6"
    >
      {/* Honeypot: invisible para humanos y screen readers, atractivo a bots. */}
      <div aria-hidden className="absolute h-0 w-0 overflow-hidden">
        <label htmlFor={`${ids.name}-website`}>Website</label>
        <input
          id={`${ids.name}-website`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      <Field
        id={ids.name}
        errId={errIds.name}
        label={t("name")}
        error={tErr(errors.name?.message)}
      >
        <Input
          id={ids.name}
          autoComplete="name"
          placeholder={t("namePlaceholder")}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? errIds.name : undefined}
          {...register("name")}
        />
      </Field>

      <Field
        id={ids.email}
        errId={errIds.email}
        label={t("email")}
        error={tErr(errors.email?.message)}
      >
        <Input
          id={ids.email}
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder={t("emailPlaceholder")}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? errIds.email : undefined}
          {...register("email")}
        />
      </Field>

      <Field
        id={ids.subject}
        errId={errIds.subject}
        label={t("subject")}
        error={tErr(errors.subject?.message)}
      >
        <Input
          id={ids.subject}
          autoComplete="off"
          placeholder={t("subjectPlaceholder")}
          aria-invalid={!!errors.subject}
          aria-describedby={errors.subject ? errIds.subject : undefined}
          {...register("subject")}
        />
      </Field>

      <Field
        id={ids.message}
        errId={errIds.message}
        label={t("message")}
        error={tErr(errors.message?.message)}
      >
        <Textarea
          id={ids.message}
          rows={7}
          placeholder={t("messagePlaceholder")}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? errIds.message : undefined}
          {...register("message")}
        />
      </Field>

      <Button type="submit" size="lg" variant="solid" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            <span>{t("sending")}</span>
          </>
        ) : (
          t("send")
        )}
      </Button>
    </form>
  );
}

/**
 * Wrapper de un campo: label asociada + slot del input + mensaje de error
 * con `role="alert"`. Mantiene la wiring de a11y consistente y reduce
 * boilerplate.
 */
function Field({
  id,
  errId,
  label,
  error,
  children,
}: {
  id: string;
  errId: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-[var(--text)]"
      >
        {label}
      </label>
      {children}
      {error && (
        <p
          id={errId}
          role="alert"
          className="mt-2 text-sm text-[var(--danger)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
