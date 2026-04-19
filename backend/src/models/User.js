export const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email       TEXT NOT NULL UNIQUE,
    password    TEXT,                        -- nullable for OAuth users
    role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin','member')),
    oauth_provider TEXT,
    oauth_sub   TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS users_org_idx ON users(org_id);
`;