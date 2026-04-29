function requireSeller(req, res, next) {
    if (!req.user || req.user.role !== "seller") {
        return res.status(403).json({ error: "Доступно только продавцам" });
    }
    next();
}

module.exports = { requireSeller };
