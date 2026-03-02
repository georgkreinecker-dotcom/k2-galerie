-- VK2-Besucher getrennt: Mitglieder und externe Besucher.
-- Erweitert visits um tenant_id 'vk2-members' und 'vk2-external'.

ALTER TABLE visits DROP CONSTRAINT IF EXISTS visits_tenant_id_check;
ALTER TABLE visits ADD CONSTRAINT visits_tenant_id_check
  CHECK (tenant_id IN ('k2', 'oeffentlich', 'vk2', 'vk2-members', 'vk2-external'));

INSERT INTO visits (tenant_id, count) VALUES ('vk2-members', 0), ('vk2-external', 0)
ON CONFLICT (tenant_id) DO NOTHING;
