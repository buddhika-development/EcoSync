import { verifyAccessJwt } from "../../utils/crypto.js";


export function requireAuth(req, res, next) {
    const token = req.cookies['access_token'];
    if (!token) return res.status(401).json({ ok: false, errors: { message: 'Unauthorized' } });

    const { payload, error } = verifyAccessJwt(token);
    if (error || !payload) return res.status(401).json({ ok: false, errors: { message: 'Invalid/expired token' } });

    req.user = { uid: payload.uid, email: payload.email, role: payload.role, name: payload.name };
    next();
}

export function requireRole(role) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ ok: false, errors: { message: 'Unauthorized' } });
        if (req.user.role !== role) return res.status(403).json({ ok: false, errors: { message: 'Forbidden' } });
        next();
    };
}
