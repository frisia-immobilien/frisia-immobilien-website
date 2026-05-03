"use client";

import { useState } from "react";

export default function SendReportButton({ leadId }: { leadId?: string }) {
  const [status, setStatus] = useState<"idle" | "pending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function sendAgain() {
    if (!leadId || status === "pending") return;
    setStatus("pending");
    setError("");

    try {
      const response = await fetch("/api/lead/resend-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      const result = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || result.success !== true) {
        throw new Error(result.error || "Die E-Mail konnte nicht erneut gesendet werden.");
      }
      setStatus("sent");
    } catch (caught) {
      setStatus("error");
      setError(caught instanceof Error ? caught.message : "Die E-Mail konnte nicht erneut gesendet werden.");
    }
  }

  return (
    <div className="mt-8 flex flex-col items-start gap-3">
      <button
        type="button"
        onClick={sendAgain}
        disabled={!leadId || status === "pending" || status === "sent"}
        className={[
          "inline-flex min-h-12 items-center justify-center rounded-xl px-5 text-sm font-semibold transition",
          leadId && status !== "sent"
            ? "bg-[color:var(--color-navy)] text-white hover:bg-[color:var(--color-brackish)]"
            : "bg-slate-200 text-slate-500",
        ].join(" ")}
      >
        {status === "pending"
          ? "E-Mail wird erneut gesendet ..."
          : status === "sent"
            ? "E-Mail erneut gesendet"
            : "E-Mail erneut senden"}
      </button>

      {!leadId ? (
        <p className="text-sm text-[color:var(--color-graphite)]">
          Falls die E-Mail nicht angekommen ist, starte die Bewertung bitte erneut oder melde dich direkt bei uns.
        </p>
      ) : null}

      {status === "error" ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
