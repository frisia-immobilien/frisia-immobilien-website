import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,

      type TEXT NOT NULL CHECK (type IN ('house','apartment','land')),
      plz TEXT NOT NULL,
      location_text TEXT,

      living_area INT,
      land_area INT,
      rooms NUMERIC(4,1),
      year_built INT,
      energy_class TEXT,
      renovation TEXT,
      fitout TEXT,
      extras TEXT,

      email TEXT NOT NULL,
      name TEXT,
      phone TEXT,
      privacy_accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      value_min INT NOT NULL,
      value_mid INT NOT NULL,
      value_max INT NOT NULL,

      opened_at TIMESTAMPTZ,
      callback_requested_at TIMESTAMPTZ
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS leads_expires_idx ON leads(expires_at);`;

  return NextResponse.json({ success: true });
}
