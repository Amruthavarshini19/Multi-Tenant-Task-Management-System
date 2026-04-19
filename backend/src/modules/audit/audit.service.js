import { db } from "../../config/db.js";

export async function createAuditEntry({ orgId, actorId, action, entityType, entityId, diff }) {
    await db.query(
        "INSERT INTO audit_logs(org_id, actor_id, action, entity_type, entity_id, diff) VALUES($1,$2,$3,$4,$5,$6)",
        [orgId, actorId, action, entityType, entityId, diff ? JSON.stringify(diff) : null]
    );
}
