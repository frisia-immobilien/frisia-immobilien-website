ALTER TABLE public.lead_requests
  ADD COLUMN IF NOT EXISTS propstack_deal_id BIGINT;

CREATE INDEX IF NOT EXISTS lead_requests_propstack_deal_id_idx
  ON public.lead_requests (propstack_deal_id);
