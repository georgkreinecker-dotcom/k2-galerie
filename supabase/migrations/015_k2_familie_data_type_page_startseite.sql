-- K2 Familie: Startseitengestaltung (page_content, page_texts) in k2_familie_data (JSON-Objekte, wie einstellungen).

ALTER TABLE public.k2_familie_data DROP CONSTRAINT IF EXISTS k2_familie_data_data_type_check;

ALTER TABLE public.k2_familie_data ADD CONSTRAINT k2_familie_data_data_type_check
  CHECK (data_type IN (
    'personen',
    'momente',
    'events',
    'einstellungen',
    'page_content',
    'page_texts'
  ));
