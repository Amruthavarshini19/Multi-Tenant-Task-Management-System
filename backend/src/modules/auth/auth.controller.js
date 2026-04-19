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
