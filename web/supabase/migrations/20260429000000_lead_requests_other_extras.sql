ALTER TABLE public.lead_requests
  ADD COLUMN IF NOT EXISTS other_extras TEXT,
  ADD COLUMN IF NOT EXISTS other_extras_value_eur NUMERIC(12,2);
