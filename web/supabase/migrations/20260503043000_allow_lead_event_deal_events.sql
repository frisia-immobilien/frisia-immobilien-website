ALTER TABLE public.lead_events
  DROP CONSTRAINT IF EXISTS lead_events_name_check;

ALTER TABLE public.lead_events
  ADD CONSTRAINT lead_events_name_check
  CHECK (event_name IN (
    'form_started',
    'object_type_selected',
    'email_entered',
    'address_entered',
    'valuation_started',
    'valuation_completed',
    'valuation_failed',
    'propstack_contact_created',
    'propstack_contact_updated',
    'propstack_property_created',
    'propstack_deal_created',
    'propstack_deal_updated',
    'propstack_note_created',
    'propstack_task_created',
    'email_sent',
    'report_opened',
    'cta_clicked',
    'phone_clicked'
  ));
