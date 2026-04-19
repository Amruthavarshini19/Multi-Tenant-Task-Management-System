import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { tenantScope } from "../../middlewares/tenantScope.js";
import { authorize } from "../../middlewares/rbac.js";
import { db } from "../../config/db.js";

const auditRouter = Router();
auditRouter.use(authenticate, tenantScope, authorize("admin"));

auditRouter.get("/", async (req, res) => {
    const { rows } = await db.query("SELECT * FROM audit_logs WHERE org_id = $1 ORDER BY created_at DESC", [req.tenantId]);
    res.json(rows);
});

export { auditRouter };
