import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { db } from "../../config/db.js";

const orgRouter = Router();
orgRouter.use(authenticate);

orgRouter.get("/", async (req, res) => {
    const { rows } = await db.query("SELECT id, name, slug, created_at FROM organizations WHERE id = $1", [req.user.orgId]);
    res.json(rows[0]);
});

export { orgRouter };
