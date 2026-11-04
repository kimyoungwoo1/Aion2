-- Existing history remains intact; old rows receive NULL IP.
-- Contains potentially identifying data; available only to administrator APIs.
ALTER TABLE admin_audit_events ADD COLUMN actor_ip TEXT;
CREATE INDEX IF NOT EXISTS idx_admin_audit_events_ip ON admin_audit_events(actor_ip, id DESC);
