-- Kurzcodes für Testpilot-Einladungs-E-Mails (lesbare einzeilige URL statt langem JWT in Plaintext)
CREATE TABLE IF NOT EXISTS pilot_short_invites (
  code TEXT PRIMARY KEY,
  token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pilot_short_invites_created_at_idx ON pilot_short_invites (created_at);

COMMENT ON TABLE pilot_short_invites IS 'Maps short /p/i/CODE to full pilot JWT; service role only.';

ALTER TABLE pilot_short_invites ENABLE ROW LEVEL SECURITY;
