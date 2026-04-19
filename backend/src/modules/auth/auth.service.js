import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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