import { Router } from "express";
import * as authController from "./auth.controller.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { oauthCallback } from "./auth.service.js";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/reset-password", authController.resetPassword);

// OAuth Google setup (Brownie points)
// OAuth Google setup
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        // Support linking to existing org via state, or auto-create if missing
        const orgId = req.query.state || null;
        const result = await oauthCallback({ provider: "google", profile, orgId });
        return done(null, result);
    } catch (err) {
        return done(err);
    }
}));

authRouter.get("/google", (req, res, next) => {
    // Note: in a real app, `state` parameter would be safely signed/encrypted.
    const state = req.query.orgId || "";
    passport.authenticate("google", { scope: ["profile", "email"], state })(req, res, next);
});

authRouter.get("/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
    const { accessToken, refreshToken, user } = req.user;
    // Redirect to frontend with token — frontend will catch it and store in localStorage
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}&refresh=${refreshToken}`);
});

export { authRouter };
