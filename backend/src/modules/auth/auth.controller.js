import * as authService from "./auth.service.js";
import { asyncWrap } from "../../middlewares/errorHandler.js";

export const register = asyncWrap(async (req, res) => {
    const tokens = await authService.register(req.body);
    res.status(201).json(tokens);
});

export const login = asyncWrap(async (req, res) => {
    const tokens = await authService.login(req.body);
    res.json(tokens);
});

export const logout = asyncWrap(async (req, res) => {
    const token = req.headers.authorization?.slice(7);
    if (token) await authService.logout(token);
    res.json({ message: "Logged out" });
});

export const forgotPassword = asyncWrap(async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    await authService.forgotPassword(email);
    // Always return success to prevent email enumeration
    res.json({ message: "If that email exists, a reset link has been sent." });
});

export const resetPassword = asyncWrap(async (req, res) => {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword)
        return res.status(400).json({ error: "Email, token, and newPassword are required" });
    if (newPassword.length < 6)
        return res.status(400).json({ error: "Password must be at least 6 characters" });
    await authService.resetPassword(email, token, newPassword);
    res.json({ message: "Password reset successfully. You can now log in." });
});
