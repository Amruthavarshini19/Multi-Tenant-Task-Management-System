import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/rbac.js";
import { db } from "../../config/db.js";
import bcrypt from "bcryptjs";

const userRouter = Router();
userRouter.use(authenticate);

// Get current user profile
userRouter.get("/me", async (req, res, next) => {
    try {
        const { rows } = await db.query(
            "SELECT id, email, role, org_id, created_at FROM users WHERE id = $1",
            [req.user.userId]
        );
        if (!rows[0]) return res.status(404).json({ error: "User not found" });
        res.json(rows[0]);
    } catch (e) {
        next(e);
    }
});

// List users in org
userRouter.get("/", async (req, res) => {
    const { rows } = await db.query("SELECT id, email, role, created_at FROM users WHERE org_id = $1", [req.user.orgId]);
    res.json(rows);
});

// Admin ONLY: create new user (invite)
userRouter.post("/invite", authorize("admin"), async (req, res, next) => {
    try {
        const { email, role, password } = req.body;
        const hash = await bcrypt.hash(password, 12);
        
        const { rows } = await db.query(
            "INSERT INTO users (org_id, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role",
            [req.user.orgId, email, hash, role || "member"]
        );
        res.status(201).json(rows[0]);
    } catch (e) {
        if (e.code === '23505') {
            res.status(409).json({ error: "User with this email already exists" });
        } else {
            next(e);
        }
    }
});

// Any Authenticated User: Update Password
userRouter.put("/password", async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Ensure user is not an OAuth only user (they don't have passwords initialized)
        const { rows } = await db.query("SELECT password FROM users WHERE id = $1", [req.user.userId]);
        const user = rows[0];
        
        if (!user) return res.status(404).json({ error: "User not found" });
        
        if (user.password) {
            const isValid = await bcrypt.compare(currentPassword, user.password);
            if (!isValid) return res.status(401).json({ error: "Incorrect current password" });
        }

        const hash = await bcrypt.hash(newPassword, 12);
        
        await db.query("UPDATE users SET password = $1 WHERE id = $2", [hash, req.user.userId]);
        
        res.json({ message: "Password updated successfully" });
    } catch (e) {
        next(e);
    }
});

export { userRouter };
