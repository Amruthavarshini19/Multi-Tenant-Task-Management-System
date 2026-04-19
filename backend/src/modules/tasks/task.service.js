import { db } from "../../config/db.js";
import { createAuditEntry } from "../audit/audit.service.js";

export async function listTasks({ orgId, userId, role }) {
    // Admins see all org tasks; members see only their own
    const filter = role === "admin"
        ? "WHERE org_id = $1"
        : "WHERE org_id = $1 AND (created_by = $2 OR assigned_to = $2)";
    const params = role === "admin" ? [orgId] : [orgId, userId];
    return db.query(`SELECT * FROM tasks ${filter} ORDER BY created_at DESC`, params);
}

export async function createTask({ orgId, userId, data }) {
    const { rows: [task] } = await db.query(
        `INSERT INTO tasks (org_id, created_by, assigned_to, title, description, status, due_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [orgId, userId, data.assignedTo || null, data.title, data.description, data.status ?? "todo", data.dueDate]
    );
    await createAuditEntry({
        orgId, actorId: userId, action: "task.created",
        entityType: "task", entityId: task.id
    });
    return task;
}

export async function updateTask({ orgId, userId, role, taskId, data }) {
    // Fetch first to enforce ownership for members
    const { rows: [existing] } = await db.query(
        "SELECT * FROM tasks WHERE id=$1 AND org_id=$2", [taskId, orgId]);
    if (!existing) throw Object.assign(new Error("Not found"), { status: 404 });
    if (role !== "admin" && existing.created_by !== userId && existing.assigned_to !== userId)
        throw Object.assign(new Error("Forbidden"), { status: 403 });

    // Members cannot change 'assigned_to', only Admins or the creator. 
    // They can only change status.
    let newAssignedTo = existing.assigned_to;
    if (data.assignedTo !== undefined && (role === "admin" || existing.created_by === userId)) {
        newAssignedTo = data.assignedTo || null;
    }

    const { rows: [updated] } = await db.query(
        `UPDATE tasks SET title=$3, description=$4, status=$5, due_date=$6, assigned_to=$7,
         updated_at=NOW() WHERE id=$1 AND org_id=$2 RETURNING *`,
        [taskId, orgId, data.title ?? existing.title, data.description ?? existing.description,
            data.status ?? existing.status, data.dueDate ?? existing.due_date, newAssignedTo]
    );
    await createAuditEntry({
        orgId, actorId: userId, action: "task.updated",
        entityType: "task", entityId: taskId,
        diff: { before: existing, after: updated }
    });
    return updated;
}

export async function deleteTask({ orgId, userId, role, taskId }) {
    const { rows: [existing] } = await db.query(
        "SELECT * FROM tasks WHERE id=$1 AND org_id=$2", [taskId, orgId]);
    if (!existing) throw Object.assign(new Error("Not found"), { status: 404 });
    if (role !== "admin" && existing.created_by !== userId)
        throw Object.assign(new Error("Forbidden"), { status: 403 });
    await db.query("DELETE FROM tasks WHERE id=$1 AND org_id=$2", [taskId, orgId]);
    await createAuditEntry({
        orgId, actorId: userId, action: "task.deleted",
        entityType: "task", entityId: taskId
    });
}