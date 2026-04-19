// Usage: router.delete("/:id", authenticate, authorize("admin"))
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Access denied: insufficient permissions" });
        }
        next();
    };
};