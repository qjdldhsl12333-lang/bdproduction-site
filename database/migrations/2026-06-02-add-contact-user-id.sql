USE bdproduction;

ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS user_id INT NULL AFTER id;

CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts (user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts (status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts (created_at);
