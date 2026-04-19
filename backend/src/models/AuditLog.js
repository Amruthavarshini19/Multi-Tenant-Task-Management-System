export const createAuditTable = `
  CREATE TABLE IF NOT EXISTS audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL,
    actor_id    UUID NOT NULL,
    action      TEXT NOT NULL,   -- 'task.created', 'task.updated', 'task.deleted'
    entity_type TEXT NOT NULL,
    entity_id   UUID NOT NULL,
    diff        JSONB,           -- before/after snapshot for updates
    created_at  TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS audit_org_idx ON audit_logs(org_id, created_at DESC);
`;