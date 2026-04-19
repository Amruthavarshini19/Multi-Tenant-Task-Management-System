export const createTasksTable = `
  CREATE TABLE IF NOT EXISTS tasks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by  UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    title       TEXT NOT NULL,
    description TEXT,
    status      TEXT NOT NULL DEFAULT 'todo'
                  CHECK (status IN ('todo','in_progress','done')),
    due_date    DATE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS tasks_org_idx   ON tasks(org_id);
  CREATE INDEX IF NOT EXISTS tasks_owner_idx ON tasks(created_by);
`;