'use client';

import Image from "next/image";
import { useMemo, useState } from "react";

import LeadCallbackTaskButton from "@/components/immobilienbewertung/valuation/LeadCallbackTaskButton.client";

type Contact = {
  id: string;
  name: string;
  role: string;
  focus: string;
  image: string;
  phoneLabel: string;
  phoneHref: string;
  mobileLabel: string;
  mobileHref: string;
  email: string;
  note: string;
};

type Props = {
  token: string;
  defaultName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
};

const contacts: Contact[] = [
  {
    id: "sebastian",
    name: "Sebastian Munzig",
    role: "Geschäftsführender Gesellschafter",
    focus: "Wohnimmobilien und Immobilienbewertung",
    image: "/images/team/sebastian-munzig-profilbild.webp",
    phoneLabel: "04941 986770-0",
    phoneHref: "tel:+4949419867700",
    mobileLabel: "0152 22100100",
    mobileHref: "tel:+4915222100100",
    email: "sebastian.munzig@frisia-immobilien.de",
    note: "DEKRA-zertifizierter Sachverständiger für Immobilienbewertung D1 und Immobilienmakler IHK.",
  },
  {
    id: "uwe",
    name: "Uwe G. Sandomeer",
    role: "Experte für Wohn- und Gewerbeimmobilien",
    focus: "Gewerbeimmobilien und regionale Marktkenntnis",
    image: "/images/team/uwe-sandomeer-profilbild.webp",
    phoneLabel: "04941 986770-0",
    phoneHref: "tel:+4949419867700",
    mobileLabel: "0172 4163711",
    mobileHref: "tel:+491724163711",
    email: "uwe.sandomeer@frisia-immobilien.de",
    note: "Stark bei Gewerbestandorten, Nutzungslogik und regionaler Einordnung in Aurich und Umgebung.",
  },
  {
    id: "tonnie",
    name: "Tonnie Olthof",
    role: "Experte für Wohn- und Ferienimmobilien",
    focus: "Ferienimmobilien und internationale Käufer",
    image: "/images/team/tonnie-olthof-profilbild2.webp",
    phoneLabel: "04941 986770-0",
    phoneHref: "tel:+4949419867700",
    mobileLabel: "0171 3690573",
    mobileHref: "tel:+491713690573",
    email: "tonnie.olthof@frisia-immobilien.de",
    note: "Stark bei Ferienimmobilien und Eigentümern mit internationaler Käuferzielgruppe.",
  },
];

export default function LeadContactChoiceClient({
  token,
  defaultName = "",
  defaultEmail = "",
  defaultPhone = "",
}: Props) {
  const [selectedId, setSelectedId] = useState(contacts[0].id);
  const selected = useMemo(
    () => contacts.find((contact) => contact.id === selectedId) ?? contacts[0],
    [selectedId],
  );

  return (
    <div className="rounded-md border border-[color:var(--color-sand)]/80 bg-white p-5 shadow-[0_28px_90px_-76px_rgba(27,48,64,0.45)] sm:p-7">
      <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
        <div>
          <div className="overflow-hidden rounded-md bg-[#eaf0f8]">
            <Image
              src={selected.image}
              alt={selected.name}
              width={620}
              height={760}
              className="aspect-[4/5] w-full object-cover"
              priority={false}
            />
          </div>
          <div className="mt-4 rounded-md bg-[#f6f8fa] p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
              Ausgewählt
            </div>
            <h3 className="mt-2 text-2xl font-semibold text-[color:var(--color-navy)]">{selected.name}</h3>
            <p className="mt-2 text-sm font-semibold text-[color:var(--color-navy)]">{selected.role}</p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--color-graphite)]">{selected.note}</p>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
            Ansprechpartner auswählen
          </div>
          <h3 className="mt-3 font-[family-name:var(--font-playfair)] text-[2.15rem] leading-[1.08] text-[color:var(--color-navy)] sm:text-[2.7rem]">
            Dein Ansprechpartner für die persönliche Prüfung
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--color-graphite)]">
            Du kannst den Ansprechpartner auswählen, der am besten zur Immobilie passt. Die Einschätzung bleibt persönlich und wird regional eingeordnet.
          </p>

          <div className="mt-6 grid gap-3">
            {contacts.map((contact) => {
              const active = selected.id === contact.id;

              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => setSelectedId(contact.id)}
                  className={[
                    "grid w-full gap-3 rounded-md border p-4 text-left transition sm:grid-cols-[58px_1fr_auto] sm:items-center",
                    active
                      ? "border-[color:var(--color-brass)] bg-[#fbf8f0]"
                      : "border-[color:var(--color-sand)]/70 bg-white hover:border-[color:var(--color-brackish)]/50",
                  ].join(" ")}
                >
                  <Image
                    src={contact.image}
                    alt=""
                    width={96}
                    height={96}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <span>
                    <span className="block text-base font-semibold text-[color:var(--color-navy)]">{contact.name}</span>
                    <span className="mt-1 block text-sm leading-6 text-[color:var(--color-graphite)]">{contact.focus}</span>
                  </span>
                  <span
                    className={[
                      "inline-flex justify-center rounded-full px-3 py-1 text-xs font-semibold",
                      active
                        ? "bg-[color:var(--color-navy)] text-white"
                        : "bg-[#f1f4f7] text-[color:var(--color-navy)]",
                    ].join(" ")}
                  >
                    {active ? "ausgewählt" : "auswählen"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <a
              href={selected.mobileHref}
              data-lead-event="callback_cta_clicked"
              data-lead-contact={selected.name}
              className="rounded-md bg-[color:var(--color-navy)] px-5 py-4 text-center text-sm font-semibold text-white transition hover:bg-[color:var(--color-brackish)]"
            >
              {selected.mobileLabel} anrufen
            </a>
            <LeadCallbackTaskButton
              key={selected.id}
              token={token}
              brokerKey={selected.id}
              defaultName={defaultName}
              defaultEmail={defaultEmail}
              defaultPhone={defaultPhone}
              label={`Termin mit ${selected.name.split(" ")[0]} anfragen`}
              doneLabel="Termin ist angefragt"
              formEyebrow="Persönliche Prüfung"
              formTitle={`Termin mit ${selected.name} anfragen`}
              messagePlaceholder="Optional: Wann passt ein Termin oder Rückruf?"
              submitLabel="Termin anfragen"
              intent="broker_appointment"
              eventType="callback_cta_clicked"
              className="rounded-md border border-[color:var(--color-sand)] bg-white px-5 py-4 text-center text-sm font-semibold text-[color:var(--color-navy)] transition hover:border-[color:var(--color-brackish)] hover:text-[color:var(--color-brackish)]"
            />
          </div>

          <div className="mt-5 grid gap-2 text-sm leading-7 text-[color:var(--color-graphite)] sm:grid-cols-2">
            <div>
              <span className="font-semibold text-[color:var(--color-navy)]">Zentrale:</span>{" "}
              <a href={selected.phoneHref} className="hover:text-[color:var(--color-brackish)]">
                {selected.phoneLabel}
              </a>
            </div>
            <div>
              <span className="font-semibold text-[color:var(--color-navy)]">E-Mail:</span>{" "}
              <a href={`mailto:${selected.email}`} className="break-all hover:text-[color:var(--color-brackish)]">
                {selected.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
