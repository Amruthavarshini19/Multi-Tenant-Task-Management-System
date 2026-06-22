import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { db } from "../../config/db.js";
import { redis } from "../../config/redis.js";

export async function register({ orgName, email, password }) {
    // Create org + first admin user atomically
    const client = await db.connect();
    try {
        await client.query("BEGIN");
        const { rows: [org] } = await client.query(
            "INSERT INTO organizations(name, slug) VALUES($1,$2) RETURNING *",
            [orgName, orgName.toLowerCase().replace(/\s+/g, "-")]
        );
        const hash = await bcrypt.hash(password, 12);
        const { rows: [user] } = await client.query(
            "INSERT INTO users(org_id,email,password,role) VALUES($1,$2,$3,'admin') RETURNING *",
            [org.id, email, hash]
        );
        await client.query("COMMIT");
        return await issueTokens(user);
    } catch (e) {
        await client.query("ROLLBACK");
        throw e;
    } finally {
        client.release();
    }
}

export async function login({ email, password }) {
    const { rows: [user] } = await db.query(
        "SELECT * FROM users WHERE email=$1", [email]);
    if (!user || !await bcrypt.compare(password, user.password))
        throw Object.assign(new Error("Invalid credentials"), { status: 401 });
    return await issueTokens(user);
}

export async function logout(token) {
    const decoded = jwt.decode(token);
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) await redis.setEx(`bl:${token}`, ttl, "1");
}

// ── Forgot Password ─────────────────────────────────────────────────────────
export async function forgotPassword(email) {
    const { rows: [user] } = await db.query(
        "SELECT id FROM users WHERE email = $1", [email]
    );
    // Always respond with success to avoid email enumeration attacks
    if (!user) return;

    // Generate a secure random 32-byte token valid for 1 hour
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await db.query(
        "UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3",
        [token, expires, user.id]
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: `"TaskFlow" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Reset your TaskFlow password",
        html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0f1117;border-radius:16px;color:#e2e8f0">
              <h1 style="font-size:24px;font-weight:700;margin-bottom:8px">🔐 Reset your password</h1>
              <p style="color:#94a3b8;margin-bottom:24px">We received a request to reset the password for your TaskFlow account. Click the button below — this link expires in <strong>1 hour</strong>.</p>
              <a href="${resetLink}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px">Reset Password</a>
              <p style="color:#64748b;font-size:12px;margin-top:24px">If you didn't request this, you can safely ignore this email. Your password will not change.</p>
            </div>
        `,
    });
}

// ── Reset Password ───────────────────────────────────────────────────────────
export async function resetPassword(email, token, newPassword) {
    const { rows: [user] } = await db.query(
        "SELECT id, reset_token, reset_token_expires FROM users WHERE email = $1",
        [email]
    );

    if (!user || user.reset_token !== token)
        throw Object.assign(new Error("Invalid or expired reset link"), { status: 400 });

    if (new Date() > new Date(user.reset_token_expires))
        throw Object.assign(new Error("Reset link has expired. Please request a new one."), { status: 400 });

    const hash = await bcrypt.hash(newPassword, 12);
    await db.query(
        "UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2",
        [hash, user.id]
    );
}

// OAuth callback — upsert user scoped to org via invite or auto-create org if new
export async function oauthCallback({ provider, profile, orgId }) {
    const { rows: [existing] } = await db.query(
        "SELECT * FROM users WHERE oauth_sub=$1 AND oauth_provider=$2",
        [profile.id, provider]
    );
    if (existing) return await issueTokens(existing);

    const client = await db.connect();
    try {
        await client.query("BEGIN");
        
        let targetOrgId = orgId;
        
        // If no org provided (new registration via Google), create a personal one
        if (!targetOrgId) {
            const orgName = `${profile.displayName || profile.name?.givenName || 'My'}'s Org`;
            const { rows: [org] } = await client.query(
                "INSERT INTO organizations(name, slug) VALUES($1,$2) RETURNING id",
                [orgName, `${orgName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`]
            );
            targetOrgId = org.id;
        }

        const email = (profile.emails?.[0]?.value || `${profile.id}@${provider}.com`).toLowerCase();
        
        // Atomic Upsert: Link to existing account or create new one
        const { rows: [user] } = await client.query(
            `INSERT INTO users (org_id, email, role, oauth_provider, oauth_sub)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (email) DO UPDATE SET
                oauth_provider = EXCLUDED.oauth_provider,
                oauth_sub = EXCLUDED.oauth_sub
             RETURNING id, org_id, email, role`,
            [targetOrgId, email, orgId ? 'member' : 'admin', provider, profile.id]
        );

        await client.query("COMMIT");
        return await issueTokens(user);
    } catch (e) {
        await client.query("ROLLBACK");
        throw e;
    } finally {
        client.release();
    }
}

async function issueTokens(user) {
    const { rows: [org] } = await db.query("SELECT name FROM organizations WHERE id=$1", [user.org_id]);
    const payload = { userId: user.id, orgId: user.org_id, orgName: org.name, role: user.role };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
    return { accessToken, refreshToken, user: { id: user.id, role: user.role, email: user.email, orgId: user.org_id, orgName: org.name } };
}