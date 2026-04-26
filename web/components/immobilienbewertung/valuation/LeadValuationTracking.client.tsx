'use client';

import { useEffect } from "react";

type Props = {
  token: string;
};

async function track(token: string, eventType: "landing_view") {
  try {
    await fetch("/api/lead/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, eventType }),
    });
  } catch {
    // Tracking darf die Seite nie stören.
  }
}

export default function LeadValuationTrackingClient({ token }: Props) {
  useEffect(() => {
    void track(token, "landing_view");
  }, [token]);

  return null;
}
