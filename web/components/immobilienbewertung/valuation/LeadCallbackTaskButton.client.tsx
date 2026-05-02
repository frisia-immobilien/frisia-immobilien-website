'use client';

import { FormEvent, useEffect, useState, useTransition } from "react";

type Props = {
  token: string;
  className: string;
  defaultName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
  label?: string;
  doneLabel?: string;
  formEyebrow?: string;
  formTitle?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
  intent?: "price_check" | "callback" | "broker_appointment";
  eventType?: "primary_cta_clicked" | "callback_cta_clicked";
  brokerKey?: string;
};

type CallbackResponse = {
  success?: boolean;
  preview?: boolean;
  error?: string;
  message?: string;
};

export default function LeadCallbackTaskButton({
  token,
  className,
  defaultName = "",
  defaultEmail = "",
  defaultPhone = "",
  label = "Ich möchte einen Rückruf",
  doneLabel = "Rückruf ist angelegt",
  formEyebrow = "Rückruf anfordern",
  formTitle = "Kontaktdaten senden",
  messagePlaceholder = "Optional: Wann passt ein Rückruf?",
  submitLabel = "Rückruf vereinbaren",
  intent = "callback",
  eventType = "callback_cta_clicked",
  brokerKey,
}: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "done" | "preview" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState(defaultPhone);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!defaultPhone) return;
    setPhone((current) => current || defaultPhone);
  }, [defaultPhone]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      setError(null);

      try {
        const response = await fetch("/api/lead/callback-task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            name,
            email,
            phone,
            message,
            intent,
            brokerKey,
          }),
        });
        const result = (await response.json().catch(() => ({}))) as CallbackResponse;

        if (!response.ok || result.success !== true) {
          throw new Error(result.error || "Rückruf konnte nicht in Propstack angelegt werden.");
        }

        setStatus(result.preview ? "preview" : "done");
        setOpen(false);
      } catch (requestError) {
        setStatus("error");
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Rückruf konnte nicht in Propstack angelegt werden.",
        );
      }
    });
  }

  return (
    <>
      <button
        type="button"
        data-lead-event={eventType}
        disabled={status === "done" || status === "preview"}
        onClick={() => setOpen(true)}
        title={error ?? undefined}
        className={[
          className,
          status === "done" || status === "preview" ? "opacity-80" : "",
          status === "error" ? "ring-2 ring-red-300" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {status === "done"
          ? doneLabel
          : status === "preview"
            ? "Preview: nicht angelegt"
            : status === "error"
              ? "Erneut versuchen"
              : label}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[140] grid place-items-center bg-[color:var(--color-navy)]/70 px-4 py-6">
          <div className="w-full max-w-[560px] rounded-md bg-white p-5 text-[color:var(--color-navy)] shadow-[0_35px_110px_-50px_rgba(0,0,0,0.55)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
                  {formEyebrow}
                </p>
                <h3 className="mt-2 text-2xl font-semibold">{formTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-3 py-1 text-2xl leading-none text-[color:var(--color-graphite)] hover:bg-[#f1f4f7]"
                aria-label="Formular schließen"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold">
                Name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="rounded-md border border-[color:var(--color-sand)] px-4 py-3 font-normal text-[color:var(--color-navy)] outline-none focus:border-[color:var(--color-brackish)]"
                  placeholder="Vor- und Nachname"
                  maxLength={160}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold">
                  Telefon
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="rounded-md border border-[color:var(--color-sand)] px-4 py-3 font-normal text-[color:var(--color-navy)] outline-none focus:border-[color:var(--color-brackish)]"
                    placeholder="Telefonnummer"
                    autoComplete="tel"
                    maxLength={80}
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold">
                  E-Mail
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="rounded-md border border-[color:var(--color-sand)] px-4 py-3 font-normal text-[color:var(--color-navy)] outline-none focus:border-[color:var(--color-brackish)]"
                    placeholder="E-Mail-Adresse"
                    autoComplete="email"
                    type="email"
                    required
                    maxLength={180}
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-semibold">
                Nachricht
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="min-h-28 rounded-md border border-[color:var(--color-sand)] px-4 py-3 font-normal text-[color:var(--color-navy)] outline-none focus:border-[color:var(--color-brackish)]"
                  placeholder={messagePlaceholder}
                  maxLength={800}
                />
              </label>

              {error ? <p className="text-sm text-red-700">{error}</p> : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-md bg-[color:var(--color-navy)] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brackish)] disabled:opacity-70"
                >
                  {pending ? "Wird in Propstack angelegt ..." : submitLabel}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-[color:var(--color-sand)] bg-white px-5 py-4 text-sm font-semibold text-[color:var(--color-navy)] transition hover:border-[color:var(--color-brackish)]"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
