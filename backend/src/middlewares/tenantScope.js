// Every DB query helper picks up req.tenantId automatically
export const tenantScope = (req, _res, next) => {
    req.tenantId = req.user.orgId;   // injected from verified JWT
    next();
};